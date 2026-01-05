'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Server, Activity, PowerOff, Cpu, Loader2, ArrowUpRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SlotCard } from '@/components/dashboard/SlotCard';
import { BotSlot } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

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
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Dashboard</h2>
                    <p className="text-muted-foreground">Welcome back, Can. Here is your system overview.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                        <Link href="/dashboard/new">
                            <Plus className="mr-2 h-4 w-4" /> New Project
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-background/40 backdrop-blur-xl border-white/5 hover:border-sidebar-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Total Projects</CardTitle>
                        <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <Server className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground mt-1">Deployed bots across all nodes</p>
                    </CardContent>
                </Card>

                <Card className="bg-background/40 backdrop-blur-xl border-white/5 hover:border-sidebar-border transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5 group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Active Instances</CardTitle>
                        <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                            <Activity className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-500">{stats.online}</div>
                        <p className="text-xs text-muted-foreground mt-1">Healthy and responding</p>
                    </CardContent>
                </Card>

                <Card className="bg-background/40 backdrop-blur-xl border-white/5 hover:border-sidebar-border transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/5 group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Resource Usage</CardTitle>
                        <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <Cpu className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalCpu}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Total CPU allocation</p>
                    </CardContent>
                </Card>

                <Card className="bg-background/40 backdrop-blur-xl border-white/5 hover:border-sidebar-border transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5 group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Offline / Stopped</CardTitle>
                        <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                            <PowerOff className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-muted-foreground">{stats.offline}</div>
                        <p className="text-xs text-muted-foreground mt-1">Inactive containers</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                {/* Main Projects Section */}
                <Card className="col-span-7 bg-transparent border-0 shadow-none">
                    <CardHeader className="px-0 pt-0">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-semibold">Your Projects</CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/dashboard" className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                                    View All <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                        <CardDescription>
                            Overview of your deployed Discord bots. Manage, monitor, and configure them here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        {bots.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <Zap className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-medium mb-2">No projects yet</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm">
                                    You don't have any bots deployed. Create your first project to get started with CANTEST.
                                </p>
                                <Button asChild size="lg">
                                    <Link href="/dashboard/new">Create Project</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {bots.map((bot) => (
                                    <div key={bot.id} className="transition-all duration-300 hover:scale-[1.02]">
                                        <SlotCard slot={bot} />
                                    </div>
                                ))}
                                {/* Add New Card Link */}
                                <Link href="/dashboard/new" className="group relative flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-white/20 p-6 hover:border-primary/50 hover:bg-white/5 transition-all duration-300 h-[180px]">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary group-hover:bg-primary/20 transition-colors shadow-sm">
                                        <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <p className="font-medium text-muted-foreground group-hover:text-foreground">Deploy new bot</p>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
