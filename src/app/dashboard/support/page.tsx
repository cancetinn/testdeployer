'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, Loader2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Ticket {
    id: string;
    subject: string;
    category: string;
    status: string;
    priority: string;
    updatedAt: string;
    author: { name: string, role: string };
    assignedTo?: { name: string };
}

export default function SupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await fetch('/api/tickets');
                if (res.ok) setTickets(await res.json());
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
        const interval = setInterval(fetchTickets, 10000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'ANSWERED': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'CLOSED': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
            default: return 'bg-secondary';
        }
    };

    if (loading && tickets.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">Loading tickets...</div>;
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Support Center</h2>
                    <p className="text-muted-foreground">Need help? Open a ticket or track your existing requests.</p>
                </div>
                <Button asChild className="gap-2">
                    <Link href="/dashboard/support/new">
                        <Plus className="h-4 w-4" /> Open New Ticket
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4">
                {tickets.length === 0 ? (
                    <Card className="border-dashed bg-background/50">
                        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                            <MessageSquare className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="font-semibold text-lg">No Tickets Yet</h3>
                            <p className="text-muted-foreground text-sm max-w-sm mt-2">
                                You haven&apos;t opened any support tickets recently. If you&apos;re facing issues, we&apos;re here to help!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    tickets.map((ticket) => (
                        <Link key={ticket.id} href={`/dashboard/support/${ticket.id}`}>
                            <Card className="bg-background/40 hover:bg-background/60 transition-colors cursor-pointer border-white/5">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-base">{ticket.subject}</h3>
                                            <Badge variant="outline" className={getStatusColor(ticket.status)}>
                                                {ticket.status}
                                            </Badge>
                                            {ticket.priority === 'URGENT' && (
                                                <Badge variant="destructive" className="h-5 text-[10px]">URGENT</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <span className="capitalize">{ticket.category}</span>
                                            <span>•</span>
                                            <span>Updated {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</span>
                                            {ticket.assignedTo && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-primary/80">Support: {ticket.assignedTo.name}</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <Badge variant="secondary" className="font-mono text-xs text-muted-foreground">
                                            #{ticket.id.slice(-6)}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
