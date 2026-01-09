import path from 'path';
import fs from 'fs';

export function getStorageDir() {
    // Priority:
    // 1. Env Var
    // 2. process.cwd() + storage/bots

    // NOTE: On the server (PM2/Docker), process.cwd() is usually the project root.
    // However, the hardcoded fallback in previous code was '/root/testdeployer/storage/bots'.
    // If the app is NOT in /root/testdeployer, that hardcode was dangerous.

    const baseDir = process.env.STORAGE_PATH
        ? process.env.STORAGE_PATH
        : path.join(process.cwd(), 'storage', 'bots');

    if (!fs.existsSync(baseDir)) {
        try {
            fs.mkdirSync(baseDir, { recursive: true });
        } catch (e) {
            console.error("Failed to create storage dir:", e);
        }
    }

    return baseDir;
}
