'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Square, RotateCw, Terminal as TerminalIcon, FolderGit2, Settings } from 'lucide-react';
import { Terminal } from '@/components/dashboard/Terminal';
import { ResourceMonitor } from '@/components/dashboard/ResourceMonitor';
import { EnvManager } from '@/components/dashboard/EnvManager';
import { DangerZone } from '@/components/dashboard/DangerZone';
import { DeploymentsList } from '@/components/dashboard/DeploymentsList';
import { CodeUploader } from '@/components/dashboard/CodeUploader';
import { BotSlot } from '@/lib/types';

export default function BotDetailPage() {
    const params = useParams(); // params can be a promise in newer Next.js versions, but useParams hook handles it usually or we wait. In Next 15+ params is async in layouts but useParams hook in client component is synchronous-ish proxy.
    const id = params.id as string;

    const [bot, setBot] = useState<any>(null); // Use proper type
    const [logs, setLogs] = useState<string[]>([]);
    const [cpuData, setCpuData] = useState<{ time: string, usage: number }[]>([]);
    const [ramData, setRamData] = useState<{ time: string, usage: number }[]>([]);
    const [loadingAction, setLoadingAction] = useState(false);

    // Poll for Bot Status & Resources
    useEffect(() => {
        async function fetchBot() {
            try {
                // Fetch Bot Info (Status, Resources)
                // Ideally we would check system PID here using `process.kill(dbPid, 0)` to check existence
                // For now we just clean up DB

                // Actually, let's fetch list and find, it's inefficient but works for MVP.
                const listRes = await fetch('/api/bots');
                if (listRes.ok) {
                    const bots = await listRes.json();
                    const currentBot = bots.find((b: any) => b.id === id);
                    if (currentBot) {
                        setBot(currentBot);
                        // Update graph data
                        const now = new Date().toLocaleTimeString();
                        setCpuData(prev => [...prev.slice(-20), { time: now, usage: currentBot.cpuUsage || 0 }]);
                        setRamData(prev => [...prev.slice(-20), { time: now, usage: currentBot.ramUsage || 0 }]);
                    }
                }

                // Fetch Logs
                const logsRes = await fetch(`/api/bots/${id}/logs`);
                if (logsRes.ok) {
                    const data = await logsRes.json();
                    setLogs(data.logs || []);
                }

            } catch (e) {
                console.error(e);
            }
        }

        fetchBot();
        const interval = setInterval(fetchBot, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [id]);

    const clearLogs = async () => {
        try {
            await fetch(`/api/bots/${id}/logs`, { method: 'DELETE' });
            setLogs([]);
        } catch (e) {
            console.error("Failed to clear logs", e);
        }
    };

    const handleAction = async (action: 'start' | 'stop' | 'restart') => {
        setLoadingAction(true);
        try {
            const res = await fetch(`/api/bots/${id}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            if (res.ok) {
                const updatedBot = await res.json();
                setBot(updatedBot);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingAction(false);
        }
    };

    if (!bot) return <div className="p-8">Loading bot...</div>;

    const isOnline = bot.status === 'online';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{bot.name}</h1>
                        <Badge variant={isOnline ? 'default' : 'destructive'} className={isOnline ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}>
                            {bot.status.toUpperCase()}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground font-mono text-sm mt-1">ID: {id}</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction('start')}
                        disabled={isOnline || loadingAction}
                        className="gap-2"
                    >
                        <Play className="h-4 w-4" /> Start
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction('restart')}
                        disabled={!isOnline || loadingAction}
                        className="gap-2"
                    >
                        <RotateCw className="h-4 w-4" /> Restart
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleAction('stop')}
                        disabled={!isOnline || loadingAction}
                        className="gap-2"
                    >
                        <Square className="h-4 w-4 fill-current" /> Stop
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Resources */}
                <div className="space-y-6 col-span-1">
                    <ResourceMonitor title="CPU Usage" data={cpuData} color="#8884d8" unit="%" />
                    <ResourceMonitor title="Memory Usage" data={ramData} color="#82ca9d" unit="MB" />
                </div>

                {/* Main Terminal Area */}
                <div className="md:col-span-2 space-y-6">
                    <Tabs defaultValue="console">
                        <TabsList>
                            <TabsTrigger value="console" className="gap-2"><TerminalIcon className="h-4 w-4" /> Console</TabsTrigger>
                            <TabsTrigger value="deployments" className="gap-2"><FolderGit2 className="h-4 w-4" /> Deployments</TabsTrigger>
                            <TabsTrigger value="settings" className="gap-2"><Settings className="h-4 w-4" /> Settings</TabsTrigger>
                        </TabsList>
                        <TabsContent value="console" className="mt-4">
                            <Terminal logs={logs} className="h-[500px]" onClear={clearLogs} />
                        </TabsContent>
                        <TabsContent value="deployments" className="space-y-6">
                            <CodeUploader botId={id} />
                            <DeploymentsList botId={id} />
                        </TabsContent>
                        <TabsContent value="settings" className="space-y-6">
                            <EnvManager botId={id} />
                            <DangerZone botId={id} botName={bot.name} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
