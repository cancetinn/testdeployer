'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, MessageSquare, Loader2, Clock, Search, AlertTriangle, CheckCircle2, ArrowRight, Inbox, Sparkles } from 'lucide-react';
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

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
            ticket.id.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const openCount = tickets.filter(t => t.status === 'OPEN').length;
    const answeredCount = tickets.filter(t => t.status === 'ANSWERED').length;
    const closedCount = tickets.filter(t => t.status === 'CLOSED').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <p className="text-gray-500 text-sm">Loading tickets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-4">
                        <Sparkles className="h-3 w-3" />
                        24/7 Support
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Help Center</h1>
                    <p className="text-gray-400 text-lg">
                        Get help from our team. Usually responds within 2 hours.
                    </p>
                </div>
                <Link
                    href="/dashboard/support/new"
                    className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-all shadow-lg shadow-white/10 shrink-0"
                >
                    <Plus className="h-4 w-4" />
                    New Ticket
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <button
                    onClick={() => setStatusFilter(statusFilter === 'OPEN' ? 'ALL' : 'OPEN')}
                    className={`p-5 rounded-2xl border transition-all ${statusFilter === 'OPEN'
                            ? 'bg-blue-500/20 border-blue-500/40'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                        }`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${statusFilter === 'OPEN' ? 'bg-blue-500/30' : 'bg-blue-500/10'}`}>
                            <Clock className="h-5 w-5 text-blue-400" />
                        </div>
                        {openCount > 0 && (
                            <span className="h-6 w-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                                {openCount}
                            </span>
                        )}
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{openCount}</p>
                    <p className="text-sm text-gray-500">Open</p>
                </button>

                <button
                    onClick={() => setStatusFilter(statusFilter === 'ANSWERED' ? 'ALL' : 'ANSWERED')}
                    className={`p-5 rounded-2xl border transition-all ${statusFilter === 'ANSWERED'
                            ? 'bg-green-500/20 border-green-500/40'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                        }`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${statusFilter === 'ANSWERED' ? 'bg-green-500/30' : 'bg-green-500/10'}`}>
                            <MessageSquare className="h-5 w-5 text-green-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-green-400">{answeredCount}</p>
                    <p className="text-sm text-gray-500">Answered</p>
                </button>

                <button
                    onClick={() => setStatusFilter(statusFilter === 'CLOSED' ? 'ALL' : 'CLOSED')}
                    className={`p-5 rounded-2xl border transition-all ${statusFilter === 'CLOSED'
                            ? 'bg-gray-500/20 border-gray-500/40'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                        }`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${statusFilter === 'CLOSED' ? 'bg-gray-500/30' : 'bg-gray-500/10'}`}>
                            <CheckCircle2 className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-400">{closedCount}</p>
                    <p className="text-sm text-gray-500">Resolved</p>
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search tickets..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 transition-all"
                />
            </div>

            {/* Ticket List */}
            <div className="space-y-3">
                {filteredTickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                        <div className="h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                            <Inbox className="h-8 w-8 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            {search || statusFilter !== 'ALL' ? 'No tickets found' : 'No tickets yet'}
                        </h3>
                        <p className="text-gray-400 mb-8 max-w-md text-center">
                            {search || statusFilter !== 'ALL'
                                ? 'Try adjusting your search or filters.'
                                : 'Have a question or issue? Open your first support ticket.'}
                        </p>
                        {!search && statusFilter === 'ALL' && (
                            <Link
                                href="/dashboard/support/new"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-all"
                            >
                                <Plus className="h-4 w-4" />
                                Create Ticket
                            </Link>
                        )}
                    </div>
                ) : (
                    filteredTickets.map((ticket) => (
                        <TicketRow key={ticket.id} ticket={ticket} />
                    ))
                )}
            </div>
        </div>
    );
}

function TicketRow({ ticket }: { ticket: Ticket }) {
    const isUrgent = ticket.priority === 'URGENT' || ticket.priority === 'HIGH';

    return (
        <Link href={`/dashboard/support/${ticket.id}`}>
            <div className="group p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                    {/* Status Indicator */}
                    <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${ticket.status === 'OPEN' ? 'bg-blue-500 animate-pulse' :
                            ticket.status === 'ANSWERED' ? 'bg-green-500' : 'bg-gray-500'
                        }`} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                                    {ticket.subject}
                                </h3>
                                {isUrgent && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-xs font-medium">
                                        <AlertTriangle className="h-3 w-3" />
                                        {ticket.priority}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-500 font-mono shrink-0">
                                #{ticket.id.slice(-6)}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${ticket.status === 'OPEN' ? 'bg-blue-500/10 text-blue-400' :
                                    ticket.status === 'ANSWERED' ? 'bg-green-500/10 text-green-400' :
                                        'bg-gray-500/10 text-gray-400'
                                }`}>
                                {ticket.status}
                            </span>
                            <span className="capitalize">{ticket.category}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</span>
                            {ticket.assignedTo && (
                                <>
                                    <span>•</span>
                                    <span className="text-purple-400">@{ticket.assignedTo.name}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                </div>
            </div>
        </Link>
    );
}
