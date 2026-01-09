'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Activity, PowerOff, Cpu, Loader2, ArrowUpRight, Zap, Rocket, Server, Clock } from 'lucide-react';
import { BotSlot } from '@/lib/types';

export default function DashboardPage() {
    const [bots, setBots] = useState<BotSlot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBots() {
            try {
                const res = await fetch('/api/bots');
                if (res.ok) {
                    const data = await res.json();
                    setBots(data);
                }
            } catch (error) {
                console.error("Failed to fetch bots:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBots();
    }, []);

    const stats = {
        total: bots.length,
        online: bots.filter(b => b.status === 'online').length,
        offline: bots.filter(b => b.status === 'offline').length,
        totalCpu: bots.reduce((acc, b) => acc + (b.cpuUsage || 0), 0).toFixed(1)
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <p className="text-gray-500 text-sm">Loading your bots...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-gray-400 mt-1">Welcome back. Here's your system overview.</p>
                </div>
                <Link
                    href="/dashboard/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-all shadow-lg shadow-white/10"
                >
                    <Plus className="h-4 w-4" />
                    New Project
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Server className="h-5 w-5" />}
                    label="Total Projects"
                    value={stats.total}
                    color="purple"
                />
                <StatCard
                    icon={<Activity className="h-5 w-5" />}
                    label="Online"
                    value={stats.online}
                    color="green"
                />
                <StatCard
                    icon={<Cpu className="h-5 w-5" />}
                    label="CPU Usage"
                    value={`${stats.totalCpu}%`}
                    color="orange"
                />
                <StatCard
                    icon={<PowerOff className="h-5 w-5" />}
                    label="Offline"
                    value={stats.offline}
                    color="gray"
                />
            </div>

            {/* Main Content */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Your Projects</h2>
                    <Link
                        href="/dashboard/bots"
                        className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        View All <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </div>

                {bots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                        <div className="h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                            <Zap className="h-8 w-8 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                        <p className="text-gray-400 mb-8 max-w-md text-center">
                            Deploy your first Discord bot in under 2 minutes. Zero configuration required.
                        </p>
                        <Link
                            href="/dashboard/new"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-all shadow-lg shadow-white/10"
                        >
                            <Rocket className="h-4 w-4" />
                            Create Your First Project
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {bots.map((bot) => (
                            <BotCard key={bot.id} bot={bot} />
                        ))}

                        {/* Add New Card */}
                        <Link
                            href="/dashboard/new"
                            className="group flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border border-dashed border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all min-h-[180px]"
                        >
                            <div className="h-12 w-12 rounded-xl bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
                                <Plus className="h-5 w-5 text-gray-500 group-hover:text-white transition-colors" />
                            </div>
                            <span className="text-sm text-gray-500 group-hover:text-white font-medium transition-colors">
                                Deploy new bot
                            </span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: 'purple' | 'green' | 'orange' | 'gray' }) {
    const colors = {
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
        orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };

    return (
        <div className={`p-5 rounded-2xl border ${colors[color]} transition-all hover:scale-[1.02]`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500">{label}</span>
                {icon}
            </div>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    );
}

function BotCard({ bot }: { bot: BotSlot }) {
    const isOnline = bot.status === 'online';

    return (
        <Link
            href={`/dashboard/bot/${bot.id}`}
            className="group p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                    <Rocket className="h-5 w-5 text-purple-400" />
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${isOnline
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-gray-500/10 text-gray-400'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
                    {isOnline ? 'Online' : 'Offline'}
                </div>
            </div>

            <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors mb-1 truncate">
                {bot.name}
            </h3>

            <div className="flex items-center gap-3 text-xs text-gray-500">
                {bot.cpuUsage !== undefined && (
                    <span className="flex items-center gap-1">
                        <Cpu className="h-3 w-3" />
                        {bot.cpuUsage}%
                    </span>
                )}
                <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {bot.uptime || 'N/A'}
                </span>
            </div>
        </Link>
    );
}
