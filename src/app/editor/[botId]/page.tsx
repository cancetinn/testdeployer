'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    File, Folder, Settings,
    ChevronRight, ChevronDown, X,
    ArrowLeft, GitBranch, Search
} from 'lucide-react';
import Link from 'next/link';
import Editor from '@monaco-editor/react';

export default function EditorPage() {
    const params = useParams();
    const botId = params.botId as string;

    const [files, setFiles] = useState([
        { name: 'index.js', type: 'file', content: '// Entry point\nconsole.log("Hello");' },
        { name: 'package.json', type: 'file', content: '{\n  "name": "bot"\n}' },
        {
            name: 'commands', type: 'folder', children: [
                { name: 'ping.js', type: 'file', content: 'module.exports = ...' }
            ]
        },
        { name: '.env', type: 'file', content: 'TOKEN=...' }
    ]);

    // State to track current file content. ideally fetch from API or file system
    const [code, setCode] = useState(`const Discord = require('discord.js');
const client = new Discord.Client();

// This is your bot's entry point
client.on('ready', () => {
  console.log(\`Logged in as \${client.user.tag}!\`);
});

client.login(process.env.DISCORD_TOKEN);`);

    return (
        <div className="flex h-screen bg-[#1e1e1e] text-[#d4d4d4] overflow-hidden font-sans">
            {/* Sidebar (Activity Bar) */}
            <div className="w-12 bg-[#333333] flex flex-col items-center py-4 gap-4 border-r border-[#1e1e1e]">
                <Link href={`/dashboard/bot/${botId}`} className="p-2 text-gray-400 hover:text-white mb-4">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <div className="p-2 text-white border-l-2 border-white bg-white/10 w-full flex justify-center">
                    <File className="h-6 w-6" />
                </div>
                <div className="p-2 text-gray-400 hover:text-white">
                    <Search className="h-6 w-6" />
                </div>
                <div className="p-2 text-gray-400 hover:text-white">
                    <GitBranch className="h-6 w-6" />
                </div>
                <div className="mt-auto p-2 text-gray-400 hover:text-white">
                    <Settings className="h-6 w-6" />
                </div>
            </div>

            {/* Sidebar (Explorer) */}
            <div className="w-64 bg-[#252526] flex flex-col border-r border-[#1e1e1e]">
                <div className="h-9 px-4 flex items-center text-xs font-bold text-gray-400 uppercase tracking-wide">
                    Explorer
                </div>

                <div className="flex-1 overflow-y-auto mt-2">
                    <div className="px-2">
                        <div className="flex items-center gap-1 py-1 text-sm font-bold text-white cursor-pointer hover:bg-[#37373d]">
                            <ChevronDown className="h-4 w-4" />
                            BOT-{botId.substring(0, 6)}
                        </div>
                        <div className="pl-4">
                            {files.map((file, i) => (
                                <div key={i} className={`flex items-center gap-1.5 py-1 px-2 text-sm cursor-pointer hover:bg-[#2a2d2e] ${i === 0 ? 'bg-[#37373d] text-white' : 'text-[#cccccc]'}`}>
                                    {file.type === 'folder' ? (
                                        <ChevronRight className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <span className="w-4" />
                                    )}
                                    {file.type === 'folder' ? (
                                        <Folder className="h-4 w-4 text-amber-500" />
                                    ) : (
                                        <File className="h-4 w-4 text-blue-400" />
                                    )}
                                    {file.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Editor */}
            <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                {/* Tabs */}
                <div className="h-9 bg-[#2d2d2d] flex items-center overflow-x-auto">
                    <div className="h-full px-3 flex items-center gap-2 bg-[#1e1e1e] border-t-2 border-purple-500 text-white min-w-[120px] text-sm">
                        <File className="h-3.5 w-3.5 text-blue-400" />
                        index.js
                        <X className="h-3.5 w-3.5 ml-auto text-gray-500 hover:text-white cursor-pointer" />
                    </div>
                    <div className="h-full px-3 flex items-center gap-2 text-[#969696] hover:bg-[#2d2d2d] min-w-[120px] text-sm cursor-pointer border-r border-[#1e1e1e]">
                        <File className="h-3.5 w-3.5 text-yellow-400" />
                        package.json
                        <X className="h-3.5 w-3.5 ml-auto text-gray-500 hover:text-white cursor-pointer" />
                    </div>
                </div>

                {/* Monaco Editor Content */}
                <div className="flex-1 relative group">
                    <Editor
                        height="100%"
                        defaultLanguage="javascript"
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        options={{
                            minimap: { enabled: true },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                        }}
                    />
                </div>

                {/* Status Bar */}
                <div className="h-6 bg-[#007acc] flex items-center px-3 text-xs text-white justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-1 rounded">
                            <GitBranch className="h-3 w-3" /> main
                        </div>
                        <div className="cursor-pointer hover:bg-white/10 px-1 rounded flex items-center gap-1">
                            <X className="h-3 w-3" /> 0 Errors
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>Ln 4, Col 21</span>
                        <span>UTF-8</span>
                        <span>JavaScript</span>
                        <span>Prettier</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
