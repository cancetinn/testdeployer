import { promises as fs } from 'fs';
import path from 'path';
import archiver from 'archiver';
import { createWriteStream } from 'fs';

// Files and patterns to exclude when publishing
const EXCLUDED_PATTERNS = [
    // Environment files
    '.env',
    '.env.*',
    '.env.local',
    '.env.development',
    '.env.production',

    // Secret files
    '*.pem',
    '*.key',
    '*.crt',
    '*.p12',
    '*.pfx',

    // Config files that might contain secrets
    'config.json',
    'secrets.json',
    'credentials.json',

    // Package management
    'node_modules',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',

    // Version control
    '.git',
    '.gitignore',

    // IDE and OS files
    '.vscode',
    '.idea',
    '.DS_Store',
    'Thumbs.db',

    // Build outputs
    'dist',
    'build',
    '.next',
];

// Regex patterns to detect secrets in code
const SECRET_PATTERNS = [
    // Discord Bot Token
    /[MN][A-Za-z\d]{23,}\.[\w-]{6}\.[\w-]{27,}/g,

    // Generic API keys
    /(?:api[_-]?key|apikey)['":\s]*['"=]?\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/gi,

    // Generic secrets
    /(?:secret|password|token|auth)['":\s]*['"=]?\s*['"]?([a-zA-Z0-9_-]{16,})['"]?/gi,

    // AWS Access Keys
    /AKIA[0-9A-Z]{16}/g,

    // MongoDB connection strings
    /mongodb\+srv:\/\/[^:]+:[^@]+@/g,

    // Database URLs with passwords
    /(?:mysql|postgres|postgresql):\/\/[^:]+:[^@]+@/g,
];

// Safe file extensions to include
const SAFE_EXTENSIONS = [
    '.js', '.ts', '.jsx', '.tsx',
    '.json', '.md', '.txt', '.yml', '.yaml',
    '.html', '.css', '.scss', '.sass',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
];

/**
 * Check if a file path should be excluded
 */
function shouldExclude(filePath: string): boolean {
    const fileName = path.basename(filePath);
    const dirName = path.dirname(filePath);

    for (const pattern of EXCLUDED_PATTERNS) {
        // Exact match
        if (fileName === pattern || filePath.includes(`/${pattern}/`) || filePath.includes(`/${pattern}`)) {
            return true;
        }

        // Wildcard pattern
        if (pattern.startsWith('*.')) {
            const ext = pattern.slice(1);
            if (fileName.endsWith(ext)) {
                return true;
            }
        }

        // Starts with pattern (like .env.*)
        if (pattern.endsWith('.*')) {
            const prefix = pattern.slice(0, -2);
            if (fileName.startsWith(prefix)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Scan file content for secrets
 */
export function scanForSecrets(content: string): string[] {
    const foundSecrets: string[] = [];

    for (const pattern of SECRET_PATTERNS) {
        const matches = content.match(pattern);
        if (matches) {
            foundSecrets.push(...matches);
        }
    }

    return [...new Set(foundSecrets)]; // Remove duplicates
}

/**
 * Get all safe files from a directory
 */
async function getSafeFiles(dirPath: string, basePath: string = dirPath): Promise<string[]> {
    const safeFiles: string[] = [];

    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            const relativePath = path.relative(basePath, fullPath);

            if (shouldExclude(relativePath) || shouldExclude(entry.name)) {
                continue;
            }

            if (entry.isDirectory()) {
                const subFiles = await getSafeFiles(fullPath, basePath);
                safeFiles.push(...subFiles);
            } else if (entry.isFile()) {
                safeFiles.push(fullPath);
            }
        }
    } catch (error) {
        console.error('Error reading directory:', error);
    }

    return safeFiles;
}

/**
 * Validate files for secrets before publishing
 */
export async function validateBotForPublishing(botPath: string): Promise<{
    valid: boolean;
    secrets: string[];
    files: string[];
}> {
    const files = await getSafeFiles(botPath);
    const allSecrets: string[] = [];

    for (const file of files) {
        try {
            // Only scan text files
            const ext = path.extname(file).toLowerCase();
            if (['.js', '.ts', '.jsx', '.tsx', '.json', '.yml', '.yaml', '.md', '.txt'].includes(ext)) {
                const content = await fs.readFile(file, 'utf-8');
                const secrets = scanForSecrets(content);
                if (secrets.length > 0) {
                    allSecrets.push(...secrets.map(s => `${path.relative(botPath, file)}: ${s.substring(0, 20)}...`));
                }
            }
        } catch (error) {
            // Skip files that can't be read
        }
    }

    return {
        valid: allSecrets.length === 0,
        secrets: allSecrets,
        files: files.map(f => path.relative(botPath, f))
    };
}

/**
 * Create a sanitized zip file of the bot
 */
export async function createSanitizedSnapshot(
    botPath: string,
    outputDir: string,
    slug: string,
    version: string
): Promise<string> {
    // Ensure output directory exists
    const snapshotDir = path.join(outputDir, 'community-bots', slug);
    await fs.mkdir(snapshotDir, { recursive: true });

    const zipPath = path.join(snapshotDir, `${version}.zip`);
    const files = await getSafeFiles(botPath);

    return new Promise((resolve, reject) => {
        const output = createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => resolve(zipPath));
        archive.on('error', reject);

        archive.pipe(output);

        for (const file of files) {
            const relativePath = path.relative(botPath, file);
            archive.file(file, { name: relativePath });
        }

        archive.finalize();
    });
}

/**
 * Generate a URL-safe slug from a bot name
 */
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
}

/**
 * Get available categories
 */
export function getCategories(): { value: string; label: string; emoji: string }[] {
    return [
        { value: 'moderation', label: 'Moderation', emoji: '🛡️' },
        { value: 'music', label: 'Music', emoji: '🎵' },
        { value: 'utility', label: 'Utility', emoji: '🔧' },
        { value: 'fun', label: 'Fun & Games', emoji: '🎮' },
        { value: 'economy', label: 'Economy', emoji: '💰' },
        { value: 'leveling', label: 'Leveling', emoji: '📊' },
        { value: 'automation', label: 'Automation', emoji: '⚙️' },
        { value: 'other', label: 'Other', emoji: '📦' },
    ];
}
