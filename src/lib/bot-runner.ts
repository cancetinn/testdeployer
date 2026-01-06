import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import util from 'util';
import { createDeployment, updateDeployment } from '@/lib/deployments';

const execAsync = util.promisify(exec);

const STORAGE_DIR = path.join(process.cwd(), 'storage', 'bots');

if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export async function manageContainer(botId: string, action: 'start' | 'stop') {
    try {
        if (action === 'stop') {
            const bot = await prisma.bot.findUnique({ where: { id: botId } });
            if (bot?.pid) {
                try {
                    // Start with SIGTERM
                    process.kill(bot.pid, 'SIGTERM');
                } catch (e: any) {
                    if (e.code !== 'ESRCH') console.error("Kill failed", e);
                }
            }

            await prisma.bot.update({
                where: { id: botId },
                data: { status: 'offline', pid: null, cpuUsage: 0, ramUsage: 0 },
            });
            return;
        }

        if (action === 'start') {
            // Check if already running
            const bot = await prisma.bot.findUnique({ where: { id: botId } });
            if (bot?.pid) {
                try {
                    process.kill(bot.pid, 0); // Check existence
                    return; // Already running
                } catch (e) {
                    // Not running
                }
            }

            const botDir = path.join(STORAGE_DIR, botId);

            // Generate simple package.json if not exists
            if (!fs.existsSync(path.join(botDir, 'package.json'))) {
                fs.writeFileSync(path.join(botDir, 'package.json'), JSON.stringify({
                    name: `bot-${botId}`,
                    version: "1.0.0",
                    main: "index.js",
                    dependencies: {
                        "discord.js": "latest",
                        "dotenv": "latest"
                    }
                }));
            }
            // Ensure index.js exists
            if (!fs.existsSync(path.join(botDir, 'index.js'))) {
                fs.writeFileSync(path.join(botDir, 'index.js'), `
                    console.log("Bot started!");
                    // setInterval(() => console.log("Heartbeat..."), 60000); // Reduced frequency
                 `);
            }

            // Install dependencies locally
            try {
                if (fs.existsSync(path.join(botDir, 'package.json'))) {
                    console.log("Installing dependencies...");
                    await execAsync('npm install', { cwd: botDir });
                }
            } catch (e) {
                console.error("NPM Install failed", e);
            }

            // Fetch Environment Variables
            const envVars = await prisma.environmentVariable.findMany({
                where: { botId }
            });

            // Create Deployment Record
            let deployment;
            try {
                deployment = await createDeployment(botId, 'building');
            } catch (err) {
                console.error("Failed to create deployment record", err);
            }

            // Prepare Env
            const env = { ...process.env };
            envVars.forEach(v => env[v.key] = v.value);

            console.log(`Starting process for ${botId}`);
            if (env.DISCORD_TOKEN) {
                console.log(`[DEBUG] Injecting DISCORD_TOKEN. Length: ${env.DISCORD_TOKEN.length}, First 5 chars: ${env.DISCORD_TOKEN.substring(0, 5)}...`);
                if (env.DISCORD_TOKEN.length < 50) {
                    console.log(`[WARN] DISCORD_TOKEN looks too short (${env.DISCORD_TOKEN.length} chars). Are you sure this isn't the Client Secret? A Bot Token is usually much longer.`);
                }
            } else {
                console.log(`[DEBUG] WARNING: DISCORD_TOKEN is missing! Keys available: ${envVars.map(v => v.key).join(', ')}`);
            }

            try {
                const logFile = path.join(botDir, 'app.log');
                // Open file for appending logs
                const out = fs.openSync(logFile, 'a');
                const err = fs.openSync(logFile, 'a');

                const child = spawn('node', ['index.js'], {
                    cwd: botDir,
                    env,
                    detached: true,
                    stdio: ['ignore', 'pipe', 'pipe'] // Pipe stdio to capture
                });

                // Stream logs to File and DB
                const logStream = fs.createWriteStream(logFile, { flags: 'a' });

                const handleLog = async (data: Buffer, type: 'stdout' | 'stderr') => {
                    const content = data.toString();

                    // 1. File (Legacy/Backup)
                    logStream.write(`[${new Date().toISOString()}] [${type}] ${content}`);

                    // 2. Database (New)
                    try {
                        const cleanContent = content.trim();
                        if (cleanContent) {
                            await prisma.botLog.create({
                                data: {
                                    botId,
                                    content: cleanContent,
                                    type
                                }
                            });
                        }
                    } catch (e) {
                        console.error("Failed to write log to DB", e);
                    }
                };

                child.stdout?.on('data', (d) => handleLog(d, 'stdout'));
                child.stderr?.on('data', (d) => handleLog(d, 'stderr'));

                child.unref();

                if (!child.pid) throw new Error("Failed to spawn process");

                await prisma.bot.update({
                    where: { id: botId },
                    data: {
                        status: 'online',
                        pid: child.pid,
                        cpuUsage: 0,
                        ramUsage: 0
                    },
                });

                // Mark deployment as success
                if (deployment) {
                    await updateDeployment(deployment.id, 'completed', 'Process started successfully');
                }

            } catch (execError: any) {
                if (deployment) {
                    await updateDeployment(deployment.id, 'failed', execError.message);
                }
                throw execError;
            }
        }

    } catch (error) {
        console.error("Runner Error:", error);
        throw error;
    }
}

export async function startBot(botId: string) {
    return manageContainer(botId, 'start');
}

export async function stopBot(botId: string) {
    return manageContainer(botId, 'stop');
}

export async function syncBotStatus(bot: any) {
    if (bot.status !== 'online' || !bot.pid) return bot;

    try {
        // Check if alive
        process.kill(bot.pid, 0);

        // Get stats
        // On Mac/Linux: ps -p <pid> -o %cpu,%mem
        const { stdout } = await execAsync(`ps -p ${bot.pid} -o %cpu,%mem`);
        // Output format:
        // %CPU %MEM
        //  0.0  0.2
        const lines = stdout.trim().split('\n');
        if (lines.length >= 2) {
            const [cpuStr, memStr] = lines[1].trim().split(/\s+/);
            const cpu = parseFloat(cpuStr) || 0;
            const mem = parseFloat(memStr) || 0;

            // Update DB
            return await prisma.bot.update({
                where: { id: bot.id },
                data: { cpuUsage: cpu, ramUsage: mem }
            });
        }
    } catch (e: any) {
        // Process dead (ESRCH) or ps failed
        if (e.code === 'ESRCH' || e.message.includes('ESRCH') || e.code === 1) {
            const updated = await prisma.bot.update({
                where: { id: bot.id },
                data: { status: 'offline', pid: null, cpuUsage: 0, ramUsage: 0 }
            });
            return updated;
        }
    }
    return bot;
}

export async function getBotLogs(botId: string): Promise<string[]> {
    try {
        // Try DB first
        const dbLogs = await prisma.botLog.findMany({
            where: { botId },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        if (dbLogs.length > 0) {
            return dbLogs.reverse().map(l => `[${l.createdAt.toISOString()}] [${l.type}] ${l.content}`);
        }

        // Fallback to File
        const logPath = path.join(STORAGE_DIR, botId, 'app.log');
        if (fs.existsSync(logPath)) {
            const content = fs.readFileSync(logPath, 'utf-8');
            return content.split('\n').filter(Boolean).slice(-100);
        }
    } catch (e) {
        console.error("Error reading logs", e);
    }
    return ["No logs yet."];
}

export async function clearBotLogs(botId: string) {
    const logPath = path.join(STORAGE_DIR, botId, 'app.log');
    if (fs.existsSync(logPath)) {
        fs.writeFileSync(logPath, '');
    }
}
