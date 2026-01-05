'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle2, XCircle, Clock, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Deployment {
    id: string;
    status: 'queued' | 'building' | 'completed' | 'failed';
    startedAt: string;
    finishedAt?: string;
    logPath?: string;
}

export function DeploymentsList({ botId }: { botId: string }) {
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeployments = async () => {
            try {
                const res = await fetch(`/api/bots/${botId}/deployments`);
                if (res.ok) {
                    const data = await res.json();
                    setDeployments(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDeployments();
        const interval = setInterval(fetchDeployments, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [botId]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
            case 'building': return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
            default: return <Clock className="h-4 w-4 text-muted-foreground" />;
        }
    };

    if (loading && deployments.length === 0) return <div className="text-center p-4">Loading history...</div>;

    return (
        <Card className="bg-background/20 h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" /> Deployment History
                </CardTitle>
                <CardDescription>
                    Recent build and start events for this bot.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        {deployments.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                No deployments yet. Start the bot to create one.
                            </div>
                        )}
                        {deployments.map((deploy) => (
                            <div key={deploy.id} className="flex items-center justify-between p-3 border rounded-lg bg-secondary/10">
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(deploy.status)}
                                    <div className="grid gap-1">
                                        <div className="font-semibold text-sm">Deployment {deploy.id.slice(0, 8)}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(deploy.startedAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant="outline" className="capitalize mb-1 block w-fit ml-auto">
                                        {deploy.status}
                                    </Badge>
                                    {deploy.finishedAt && (
                                        <span className="text-xs text-muted-foreground">
                                            {// Duration could be calculated here
                                                Math.floor((new Date(deploy.finishedAt).getTime() - new Date(deploy.startedAt).getTime()) / 1000)
                                            }s
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
