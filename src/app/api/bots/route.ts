import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncBotStatus } from "@/lib/bot-runner";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) return new NextResponse("User not found", { status: 404 });

        const bots = await prisma.bot.findMany({
            where: {
                OR: [
                    { ownerId: user.id },
                    {
                        team: {
                            members: {
                                some: {
                                    userId: user.id
                                }
                            }
                        }
                    }
                ]
            },
            include: {
                team: true // Include team info to display badge if needed
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        const syncedBots = await Promise.all(bots.map((bot: any) => syncBotStatus(bot)));

        return NextResponse.json(syncedBots);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, description, teamId, repoUrl } = body;

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Validate team membership if teamId provided
        if (teamId) {
            const teamMember = await prisma.teamMember.findUnique({
                where: {
                    teamId_userId: {
                        teamId,
                        userId: user.id
                    }
                }
            });
            if (!teamMember) {
                return new NextResponse("You are not a member of this team", { status: 403 });
            }
        }

        const bot = await prisma.bot.create({
            data: {
                name,
                description,
                ownerId: user.id,
                teamId: teamId, // Assign team if present
                status: 'offline',
                githubRepo: repoUrl || undefined
            },
        });

        // Detect storage path (Docker vs Local)
        // In this environment, we assume specific paths based on previous errors
        // The error log showed: /root/testdeployer/storage/bots/...
        const botId = bot.id;
        const storagePath = process.env.STORAGE_PATH || '/root/testdeployer/storage/bots';
        // fallback to logged path if env missing, or current directory structure

        if (repoUrl) {
            // Fetch GitHub Token
            const account = await prisma.account.findFirst({
                where: {
                    userId: user.id,
                    provider: 'github'
                }
            });

            if (account && account.access_token) {
                const fs = require('fs');
                const path = require('path');
                const { exec } = require('child_process');
                const util = require('util');
                const execAsync = util.promisify(exec);

                const botDir = path.join(storagePath, botId);

                // Ensure parent dir exists
                if (!fs.existsSync(storagePath)) {
                    fs.mkdirSync(storagePath, { recursive: true });
                }

                // Construct Auth URL
                // user/repo -> https://accessToken@github.com/user/repo.git
                // repoUrl from frontend is html_url (https://github.com/user/repo)
                const cleanUrl = repoUrl.replace('https://github.com/', '');
                const cloneUrl = `https://${account.access_token}@github.com/${cleanUrl}.git`;

                console.log(`Cloning ${cleanUrl} to ${botDir}...`);

                try {
                    await execAsync(`git clone ${cloneUrl} ${botDir}`);
                    console.log("Clone successful!");

                    // Install dependencies (MVP: npm install)
                    if (fs.existsSync(path.join(botDir, 'package.json'))) {
                        console.log("Installing dependencies...");
                        try {
                            await execAsync(`cd ${botDir} && npm install --production`);
                        } catch (npmError) {
                            console.error("NPM Install failed:", npmError);
                        }
                    } else {
                        console.warn("No package.json found in cloned repo");
                    }

                } catch (cloneError: any) {
                    console.error("Clone failed:", cloneError);
                    // Return error to frontend so user knows why deployment failed
                    return NextResponse.json({
                        ...bot,
                        error: `Git clone failed: ${cloneError.message || cloneError}`
                    }, { status: 500 });
                }
            } else {
                console.error("GitHub account not found for user");
            }
        }

        return NextResponse.json(bot);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
