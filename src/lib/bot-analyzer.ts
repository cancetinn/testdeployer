import fs from 'fs';
import path from 'path';

export interface BotAnalysisResult {
    isValidDiscordBot: boolean;
    entryPoint: string | null;
    framework: 'discord.js' | 'other' | null;
    warnings: string[];
}

export async function analyzeBotProject(projectDir: string): Promise<BotAnalysisResult> {
    const result: BotAnalysisResult = {
        isValidDiscordBot: false,
        entryPoint: null,
        framework: null,
        warnings: []
    };

    // 1. Check package.json
    const pkgPath = path.join(projectDir, 'package.json');
    let pkgMain = null;
    let hasDiscordDep = false;

    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
            if (pkg.main && fs.existsSync(path.join(projectDir, pkg.main))) {
                pkgMain = pkg.main;
            }
            if (pkg.dependencies && (pkg.dependencies['discord.js'] || pkg.dependencies['discord.js-selfbot-v13'])) {
                hasDiscordDep = true;
                result.framework = 'discord.js';
            }
        } catch (e) {
            result.warnings.push("Invalid package.json file.");
        }
    }

    // 2. Scan for candidate files if no package.json main
    // We look for .js/.ts files in root and src/
    const candidates = await scanForEntryFile(projectDir);

    // 3. Analyze content of candidates
    // If we have a pkgMain, verify it looks like a bot.
    // If not, pick the best candidate that looks like a bot.

    if (pkgMain) {
        // Verify explicit main
        const isBot = await fileContainsBotCode(path.join(projectDir, pkgMain));
        if (isBot) {
            result.isValidDiscordBot = true;
            result.entryPoint = pkgMain;
        } else {
            // It might be a wrapper, but let's check if it exists validly.
            // If it has discord dependency, we trust package.json main usually.
            if (hasDiscordDep) {
                result.isValidDiscordBot = true;
                result.entryPoint = pkgMain;
            } else {
                result.warnings.push("package.json 'main' does not seemingly contain Discord bot code.");
                // Fallback scan?
                result.entryPoint = pkgMain; // Trust user config primarily
            }
        }
    } else {
        // Auto-detect from candidates
        for (const file of candidates) {
            if (await fileContainsBotCode(path.join(projectDir, file))) {
                result.isValidDiscordBot = true;
                result.entryPoint = file;
                break; // Found one!
            }
        }

        if (!result.entryPoint && candidates.length > 0) {
            // No obvious bot code found, but files exist. 
            // Default to common names if they exist
            const common = ['index.js', 'bot.js', 'main.js', 'app.js', 'src/index.js', 'src/bot.js'];
            const found = common.find(c => candidates.includes(c));
            if (found) {
                result.entryPoint = found;
                result.warnings.push(`No explicit bot code detected, defaulting to common file: ${found}`);
            } else {
                // Just take the first one?
                result.entryPoint = candidates[0];
                result.warnings.push(`No explicit bot code detected, defaulting to first file: ${candidates[0]}`);
            }
        }
    }

    if (!result.entryPoint) {
        result.warnings.push("No entry file could be determined.");
    }

    // Final hard check on dependency if we want to be strict
    if (!hasDiscordDep && result.isValidDiscordBot) {
        result.warnings.push("Code looks like a bot but 'discord.js' is missing from package.json dependencies.");
    }

    return result;
}

// Recursive(ish) or just flat scan relevant folders
async function scanForEntryFile(dir: string): Promise<string[]> {
    const validExts = ['.js', '.ts'];
    const candidates: string[] = [];

    // Read root
    try {
        const rootFiles = fs.readdirSync(dir);
        for (const file of rootFiles) {
            if (validExts.includes(path.extname(file))) {
                candidates.push(file);
            }
        }

        // Read src/ if exists
        const srcDir = path.join(dir, 'src');
        if (fs.existsSync(srcDir) && fs.statSync(srcDir).isDirectory()) {
            const srcFiles = fs.readdirSync(srcDir);
            for (const file of srcFiles) {
                if (validExts.includes(path.extname(file))) {
                    candidates.push(path.join('src', file));
                }
            }
        }
    } catch (e) { }

    // Priority sort: index.js, bot.js, main.js, app.js
    const priorities = ['index', 'bot', 'main', 'app', 'client'];
    candidates.sort((a, b) => {
        const aName = path.parse(a).name.toLowerCase();
        const bName = path.parse(b).name.toLowerCase();
        const aP = priorities.indexOf(aName);
        const bP = priorities.indexOf(bName);

        // If both are priority names, lower index wins (index < bot)
        if (aP > -1 && bP > -1) return aP - bP;
        // If only a is priority, it comes first
        if (aP > -1) return -1;
        if (bP > -1) return 1;
        // Default alpha
        return a.localeCompare(b);
    });

    return candidates;
}

async function fileContainsBotCode(filePath: string): Promise<boolean> {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        // Heuristic patterns
        const patterns = [
            /require\(['"]discord\.js['"]\)/,
            /import.*from ['"]discord\.js['"]/,
            /new (Discord\.)?Client\(/,
            /\.login\(/,
            /client\.on\(['"]ready['"]/,
            /extends (Discord\.)?Client/
        ];

        return patterns.some(p => p.test(content));
    } catch (e) {
        return false;
    }
}
