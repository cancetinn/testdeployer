'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, MessageSquare, Loader2, Clock, Search, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Ticket {
    id: string;
    subject: string;
    category: string;
    status: string;
    priority: string;
    updatedAt: string;
    createdAt: string;
    author: { name: string, role: string };
    assignedTo?: { name: string };
    _count?: { messages: number };
}

export default function SupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');

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
        const interval = setInterval(fetchTickets, 15000);
        return () => clearInterval(interval);
    }, []);

    // Filter tickets
    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
            ticket.id.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
        const matchesPriority = priorityFilter === 'ALL' || ticket.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    // Stats
    const openCount = tickets.filter(t => t.status === 'OPEN').length;
    const answeredCount = tickets.filter(t => t.status === 'ANSWERED').length;
    const closedCount = tickets.filter(t => t.status === 'CLOSED').length;

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'OPEN': return { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Clock };
            case 'ANSWERED': return { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 };
            case 'CLOSED': return { color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: CheckCircle2 };
            default: return { color: 'bg-secondary', icon: Clock };
        }
    };

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case 'URGENT': return { color: 'bg-red-500/10 text-red-500 border-red-500/30', label: 'Urgent' };
            case 'HIGH': return { color: 'bg-orange-500/10 text-orange-500 border-orange-500/30', label: 'High' };
            case 'MEDIUM': return { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30', label: 'Medium' };
            case 'LOW': return { color: 'bg-gray-500/10 text-gray-400 border-gray-500/30', label: 'Low' };
            default: return { color: 'bg-secondary', label: priority };
        }
    };

    if (loading && tickets.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Support Center
                    </h2>
                    <p className="text-muted-foreground">Need help? Open a ticket or track your existing requests.</p>
                </div>
                <Button asChild className="gap-2 shadow-lg shadow-primary/20">
                    <Link href="/dashboard/support/new">
                        <Plus className="h-4 w-4" /> New Ticket
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-blue-400">{openCount}</p>
                            <p className="text-sm text-muted-foreground">Open Tickets</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 hover:border-green-500/40 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-green-400">{answeredCount}</p>
                            <p className="text-sm text-muted-foreground">Answered</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-gray-500/10 to-gray-500/5 border-gray-500/20 hover:border-gray-500/40 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gray-500/20 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-400">{closedCount}</p>
                            <p className="text-sm text-muted-foreground">Resolved</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tickets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-background/50 border-white/10"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {/* Status Filter */}
                    <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                        <TabsList className="bg-background/50">
                            <TabsTrigger value="ALL" className="text-xs">All</TabsTrigger>
                            <TabsTrigger value="OPEN" className="text-xs">Open</TabsTrigger>
                            <TabsTrigger value="ANSWERED" className="text-xs">Answered</TabsTrigger>
                            <TabsTrigger value="CLOSED" className="text-xs">Closed</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    {/* Priority Filter */}
                    <Tabs value={priorityFilter} onValueChange={setPriorityFilter}>
                        <TabsList className="bg-background/50">
                            <TabsTrigger value="ALL" className="text-xs">All Priority</TabsTrigger>
                            <TabsTrigger value="URGENT" className="text-xs text-red-400">Urgent</TabsTrigger>
                            <TabsTrigger value="HIGH" className="text-xs text-orange-400">High</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Ticket List */}
            <div className="space-y-3">
                {filteredTickets.length === 0 ? (
                    <Card className="border-dashed bg-background/30">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">No Tickets Found</h3>
                            <p className="text-muted-foreground text-sm max-w-sm">
                                {search || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                                    ? "No tickets match your filters. Try adjusting your search."
                                    : "You haven't opened any support tickets yet. We're here to help!"}
                            </p>
                            {!search && statusFilter === 'ALL' && (
                                <Button asChild className="mt-6 gap-2">
                                    <Link href="/dashboard/support/new">
                                        <Plus className="h-4 w-4" /> Create Your First Ticket
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    filteredTickets.map((ticket) => {
                        const statusConfig = getStatusConfig(ticket.status);
                        const priorityConfig = getPriorityConfig(ticket.priority);
                        const StatusIcon = statusConfig.icon;

                        return (
                            <Link key={ticket.id} href={`/dashboard/support/${ticket.id}`}>
                                <Card className="group bg-background/40 hover:bg-background/60 transition-all duration-200 border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-primary/5">
                                    <CardContent className="p-5 flex items-start gap-4">
                                        {/* Status Icon */}
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${ticket.status === 'OPEN' ? 'bg-blue-500/20' : ticket.status === 'ANSWERED' ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                                            <StatusIcon className={`h-5 w-5 ${ticket.status === 'OPEN' ? 'text-blue-400' : ticket.status === 'ANSWERED' ? 'text-green-400' : 'text-gray-400'}`} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-base group-hover:text-primary transition-colors truncate">
                                                        {ticket.subject}
                                                    </h3>
                                                    <Badge variant="outline" className={statusConfig.color}>
                                                        {ticket.status}
                                                    </Badge>
                                                    {(ticket.priority === 'URGENT' || ticket.priority === 'HIGH') && (
                                                        <Badge variant="outline" className={priorityConfig.color}>
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            {priorityConfig.label}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Badge variant="secondary" className="font-mono text-xs text-muted-foreground shrink-0">
                                                    #{ticket.id.slice(-6)}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                                <span className="capitalize">{ticket.category}</span>
                                                <span>•</span>
                                                <span>{formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</span>
                                                {ticket.assignedTo && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-primary/70">Agent: {ticket.assignedTo.name}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Author Avatar */}
                                        <Avatar className="h-8 w-8 border border-white/10 shrink-0">
                                            <AvatarFallback className="text-xs">{ticket.author.name[0]}</AvatarFallback>
                                        </Avatar>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
