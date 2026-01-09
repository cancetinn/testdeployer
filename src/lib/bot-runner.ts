import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import util from 'util';
import { createDeployment, updateDeployment } from '@/lib/deployments';

const execAsync = util.promisify(exec);

import { getStorageDir } from '@/lib/storage';

const execAsync = util.promisify(exec);

// Legacy check removed, as getStorageDir handles creation


export async function manageContainer(botId: string, action: 'start' | 'stop') {
    const STORAGE_DIR = getStorageDir();
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

            // Ensure bot directory exists
            if (!fs.existsSync(botDir)) {
                console.warn(`[WARN] Bot directory missing for ${botId}, creating empty dir.`);
                fs.mkdirSync(botDir, { recursive: true });
            }

            // DEBUG: List files to ensure clone worked
            try {
                const files = fs.readdirSync(botDir);
                console.log(`[DEBUG] Files in ${botId}: ${files.join(', ')}`);
                await prisma.botLog.create({
                    data: { botId, content: `[SYSTEM INFO] Files in dir: ${files.join(', ')}`, type: 'stdout' }
                });
            } catch (e) { }

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
                    // Keep process alive
                    setInterval(() => console.log("Heartbeat..."), 60000); 
                 `);
            }

            // Create Deployment Record
            let deployment;
            // Install dependencies locally
            try {
                if (fs.existsSync(path.join(botDir, 'package.json'))) {
                    console.log("Installing dependencies...");
                    // We verify by running it.
                    await execAsync('npm install', { cwd: botDir });
                }
            } catch (e: any) {
                const msg = `[SYSTEM ERROR] NPM Install failed: ${e.message}`;
                console.error(msg);
                await prisma.botLog.create({
                    data: { botId, content: msg, type: 'stderr' }
                });
                // Abort start
                await updateDeployment(deployment?.id || '', 'failed', 'Dependency installation failed.');
                return;
            }

            // Fetch Environment Variables
            const envVars = await prisma.environmentVariable.findMany({
                where: { botId }
            });

            // Create Deployment Record (if not already exists from upload?)
            // Actually upload creates one, but 'start' button creates one too?
            // If we have deployment from above, use it.
            if (!deployment) {
                try {
                    deployment = await createDeployment(botId, 'building');
                } catch (err) { }
            }

            // Prepare Env
            const env = { ...process.env };
            envVars.forEach(v => env[v.key] = v.value);

            console.log(`Starting process for ${botId}`);

            // Security: Ensure token exists but do not log it
            if (!env.DISCORD_TOKEN) {
                const msg = "[SYSTEM WARN] DISCORD_TOKEN is missing! The bot will likely fail to start. Please check 'Environment' tab.";

                await prisma.botLog.create({
                    data: { botId, content: msg, type: 'stderr' }
                }).catch(() => { });
            }

            try {
                const logFile = path.join(botDir, 'app.log');
                // Open file for appending logs
                const out = fs.openSync(logFile, 'a');
                const err = fs.openSync(logFile, 'a');

                // Determine entry point from package.json
                let entryFile = 'index.js';
                try {
                    const pkgPath = path.join(botDir, 'package.json');
                    if (fs.existsSync(pkgPath)) {
                        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
                        if (pkg.main) {
                            entryFile = pkg.main;
                        }
                    }
                } catch (e) { }

                // Check if file actually exists
                if (!fs.existsSync(path.join(botDir, entryFile))) {
                    const errorMsg = `[SYSTEM ERROR] Entry file '${entryFile}' not found. Please check your package.json 'main' field.`;
                    await prisma.botLog.create({
                        data: { botId, content: errorMsg, type: 'stderr' }
                    });

                    await prisma.bot.update({ where: { id: botId }, data: { status: 'offline' } });
                    return;
                }

                const child = spawn('node', [entryFile], {
                    cwd: botDir,
                    env,
                    detached: true,
                    stdio: ['ignore', 'pipe', 'pipe']
                });

                // Capture immediate exit
                child.on('exit', async (code) => {
                    if (code !== 0 && code !== null) {
                        const msg = `[SYSTEM ERROR] Process exited immediately with code ${code}. Check code for syntax errors or missing modules.`;
                        await prisma.botLog.create({
                            data: { botId, content: msg, type: 'stderr' }
                        }).catch(() => { });

                        await prisma.bot.update({ where: { id: botId }, data: { status: 'offline' } });
                    }
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
                        // Silent fail for log write
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
    const STORAGE_DIR = getStorageDir();
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
    const STORAGE_DIR = getStorageDir();
    const logPath = path.join(STORAGE_DIR, botId, 'app.log');
    if (fs.existsSync(logPath)) {
        fs.writeFileSync(logPath, '');
    }
}
