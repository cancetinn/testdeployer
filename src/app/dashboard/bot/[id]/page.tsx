'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Play, Square, RotateCw, Terminal as TerminalIcon, FolderGit2, Settings,
    Share2, Cpu, HardDrive, Clock, Activity, ArrowLeft, Zap, Server, Wifi, Code2
} from 'lucide-react';
import { Terminal } from '@/components/dashboard/Terminal';
import { ResourceMonitor } from '@/components/dashboard/ResourceMonitor';
import { EnvManager } from '@/components/dashboard/EnvManager';
import { DangerZone } from '@/components/dashboard/DangerZone';
import { DeploymentsList } from '@/components/dashboard/DeploymentsList';
import { CodeUploader } from '@/components/dashboard/CodeUploader';
import { toast } from 'sonner';

export default function BotDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [bot, setBot] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [cpuData, setCpuData] = useState<{ time: string, usage: number }[]>([]);
    const [ramData, setRamData] = useState<{ time: string, usage: number }[]>([]);
    const [loadingAction, setLoadingAction] = useState(false);

    useEffect(() => {
        async function fetchBot() {
            try {
                const listRes = await fetch('/api/bots');
                if (listRes.ok) {
                    const bots = await listRes.json();
                    const currentBot = bots.find((b: any) => b.id === id);
                    if (currentBot) {
                        setBot(currentBot);
                        const now = new Date().toLocaleTimeString();
                        setCpuData(prev => [...prev.slice(-20), { time: now, usage: currentBot.cpuUsage || 0 }]);
                        setRamData(prev => [...prev.slice(-20), { time: now, usage: currentBot.ramUsage || 0 }]);
                    }
                }

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
        const interval = setInterval(fetchBot, 10000);
        return () => clearInterval(interval);
    }, [id]);

    const clearLogs = async () => {
        try {
            await fetch(`/api/bots/${id}/logs`, { method: 'DELETE' });
            setLogs([]);
            toast.success('Logs cleared');
        } catch (e) {
            toast.error('Failed to clear logs');
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
                toast.success(`Bot ${action}ed successfully`);
            } else {
                toast.error(`Failed to ${action} bot`);
            }
        } catch (e) {
            toast.error(`Failed to ${action} bot`);
        } finally {
            setLoadingAction(false);
        }
    };

    if (!bot) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="h-16 w-16 border-4 border-purple-500/20 rounded-full" />
                        <div className="h-16 w-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
                    </div>
                    <p className="text-gray-400 text-sm">Loading bot...</p>
                </div>
            </div>
        );
    }

    const isOnline = bot.status === 'online';

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto">
            {/* Back Button */}
            <Link
                href="/dashboard/bots"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm group"
            >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to My Bots
            </Link>

            {/* Hero Header */}
            <div className="relative rounded-2xl overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/10 to-cyan-600/20" />
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/30 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/20 rounded-full blur-[80px]" />
                </div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

                <div className="relative border border-white/10 rounded-2xl p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        {/* Bot Info */}
                        <div className="flex items-start gap-5">
                            {/* Bot Avatar with Glow */}
                            <div className="relative">
                                <div className={`absolute inset-0 rounded-2xl blur-xl ${isOnline ? 'bg-green-500/40' : 'bg-gray-500/20'}`} />
                                <div className={`relative h-20 w-20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-2xl ${isOnline
                                        ? 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600'
                                        : 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700'
                                    }`}>
                                    {bot.name.charAt(0).toUpperCase()}
                                </div>
                                {/* Status Indicator */}
                                <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-[#0a0a0a] ${isOnline ? 'bg-green-500' : 'bg-gray-600'
                                    }`}>
                                    {isOnline && (
                                        <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{bot.name}</h1>
                                    <Badge
                                        className={`${isOnline
                                            ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                                            } border px-3 py-1`}
                                    >
                                        <Wifi className={`h-3 w-3 mr-1.5 ${isOnline ? 'animate-pulse' : ''}`} />
                                        {bot.status.toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1.5">
                                        <Server className="h-3.5 w-3.5" />
                                        <code className="text-xs bg-white/5 px-2 py-0.5 rounded">{id.slice(0, 12)}...</code>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Code2 className="h-3.5 w-3.5" />
                                        Node.js
                                    </span>
                                </div>
                                {bot.description && (
                                    <p className="text-gray-400 text-sm max-w-lg">{bot.description}</p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                size="sm"
                                onClick={() => handleAction('start')}
                                disabled={isOnline || loadingAction}
                                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 disabled:opacity-40 gap-2"
                            >
                                <Play className="h-4 w-4" /> Start
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleAction('restart')}
                                disabled={!isOnline || loadingAction}
                                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 disabled:opacity-40 gap-2"
                            >
                                <RotateCw className="h-4 w-4" /> Restart
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleAction('stop')}
                                disabled={!isOnline || loadingAction}
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 disabled:opacity-40 gap-2"
                            >
                                <Square className="h-4 w-4" /> Stop
                            </Button>

                            <div className="hidden sm:block w-px h-8 bg-white/10 mx-1" />

                            <Link href={`/dashboard/bot/${id}/publish`}>
                                <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-purple-300 border border-purple-500/30 gap-2"
                                >
                                    <Share2 className="h-4 w-4" /> Publish
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[
                    { icon: Cpu, label: 'CPU Usage', value: `${bot.cpuUsage || 0}%`, color: 'purple', glow: 'purple' },
                    { icon: HardDrive, label: 'Memory', value: `${bot.ramUsage || 0} MB`, color: 'blue', glow: 'blue' },
                    { icon: Activity, label: 'Status', value: isOnline ? 'Online' : 'Offline', color: isOnline ? 'green' : 'gray', glow: isOnline ? 'green' : 'gray' },
                    { icon: Clock, label: 'Uptime', value: bot.uptime ? `${Math.floor(bot.uptime / 60)}m` : '—', color: 'orange', glow: 'orange' },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className="group relative p-4 md:p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300"
                    >
                        <div className={`absolute inset-0 rounded-xl bg-${stat.glow}-500/5 opacity-0 group-hover:opacity-100 transition-opacity`} />
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                                    <stat.icon className={`h-4 w-4 text-${stat.color}-400`} />
                                </div>
                                <span className="text-xs md:text-sm text-gray-500 font-medium">{stat.label}</span>
                            </div>
                            <div className={`text-xl md:text-2xl font-bold ${stat.label === 'Status'
                                    ? isOnline ? 'text-green-400' : 'text-gray-500'
                                    : 'text-white'
                                }`}>
                                {stat.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Resource Charts - Left Column */}
                <div className="xl:col-span-4 space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Zap className="h-4 w-4 text-purple-400" />
                        <h3 className="text-sm font-semibold text-gray-300">Resource Monitoring</h3>
                    </div>
                    <ResourceMonitor title="CPU Usage" data={cpuData} color="#a855f7" unit="%" />
                    <ResourceMonitor title="Memory Usage" data={ramData} color="#3b82f6" unit="MB" />
                </div>

                {/* Tabs Content - Right Column */}
                <div className="xl:col-span-8">
                    <Tabs defaultValue="console" className="w-full">
                        <TabsList className="w-full justify-start bg-white/[0.02] border border-white/[0.06] p-1 rounded-xl gap-1">
                            <TabsTrigger
                                value="console"
                                className="flex-1 sm:flex-none gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 data-[state=active]:border-purple-500/30 rounded-lg transition-all"
                            >
                                <TerminalIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Console</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="deployments"
                                className="flex-1 sm:flex-none gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 data-[state=active]:border-purple-500/30 rounded-lg transition-all"
                            >
                                <FolderGit2 className="h-4 w-4" />
                                <span className="hidden sm:inline">Deployments</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="settings"
                                className="flex-1 sm:flex-none gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 data-[state=active]:border-purple-500/30 rounded-lg transition-all"
                            >
                                <Settings className="h-4 w-4" />
                                <span className="hidden sm:inline">Settings</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="console" className="mt-4">
                            <div className="rounded-xl border border-white/[0.06] overflow-hidden bg-black/20">
                                <Terminal logs={logs} className="h-[400px] md:h-[450px]" onClear={clearLogs} />
                            </div>
                        </TabsContent>

                        <TabsContent value="deployments" className="mt-4 space-y-4">
                            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                                <CodeUploader botId={id} />
                            </div>
                            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                                <DeploymentsList botId={id} />
                            </div>
                        </TabsContent>

                        <TabsContent value="settings" className="mt-4 space-y-4">
                            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                                <EnvManager botId={id} />
                            </div>
                            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                                <DangerZone botId={id} botName={bot.name} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
