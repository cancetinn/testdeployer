'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Clock, ExternalLink, Activity } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';

interface Deployment {
    id: string;
    status: 'queued' | 'building' | 'completed' | 'failed';
    startedAt: string;
    finishedAt?: string;
    bot: {
        id: string;
        name: string;
    }
}

export default function DeploymentsPage() {
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeployments = async () => {
            try {
                const res = await fetch('/api/deployments');
                if (res.ok) {
                    const data = await res.json();
                    setDeployments(data);
                }
            } catch (error) {
                console.error("Failed to fetch deployments", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDeployments();
        const interval = setInterval(fetchDeployments, 5000);
        return () => clearInterval(interval);
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
            case 'building': return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
            default: return <Clock className="h-4 w-4 text-muted-foreground" />;
        }
    };

    if (loading && deployments.length === 0) {
        return (
            <div className="flex-1 p-8 pt-6 flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Deployments</h2>
                    <p className="text-muted-foreground">Global deployment history across all your projects.</p>
                </div>
            </div>

            <Card className="bg-background/40 backdrop-blur-xl border-white/5">
                <CardHeader>
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <Activity className="h-5 w-5" />
                    </div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                        Real-time log of all build and deployment events.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-white/10">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow>
                                    <TableHead className="w-[100px]">Status</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Deployment ID</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deployments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No deployments found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    deployments.map((deploy) => (
                                        <TableRow key={deploy.id} className="hover:bg-white/5 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(deploy.status)}
                                                    <Badge variant="outline" className="capitalize bg-transparent border-white/20">
                                                        {deploy.status}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                                        {deploy.bot.name.substring(0, 1).toUpperCase()}
                                                    </div>
                                                    {deploy.bot.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {deploy.id.slice(0, 8)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {formatDistanceToNow(new Date(deploy.startedAt), { addSuffix: true })}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground font-mono text-xs">
                                                {deploy.finishedAt ? (
                                                    <span>
                                                        {Math.floor((new Date(deploy.finishedAt).getTime() - new Date(deploy.startedAt).getTime()) / 1000)}s
                                                    </span>
                                                ) : (
                                                    <span className="text-blue-400 animate-pulse">Running...</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/dashboard/bot/${deploy.bot.id}?tab=deployments`}>
                                                        <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-white" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
