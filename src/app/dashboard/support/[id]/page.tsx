'use client';

import { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import { Loader2, Send, ArrowLeft, Lock, Unlock, CheckCircle2, Paperclip, MoreHorizontal, User } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Message {
    id: string;
    content: string;
    createdAt: string;
    sender: {
        id: string;
        name: string;
        role: string;
        image?: string;
    };
}

interface Ticket {
    id: string;
    subject: string;
    status: string;
    category: string;
    priority: string;
    assignedToId?: string;
    assignedTo?: { name: string };
    messages: Message[];
}

export default function TicketChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSession();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const [staffMembers, setStaffMembers] = useState<any[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const currentUserId = (session?.user as any)?.id;
    const isStaff = (session?.user as any)?.role && ['FOUNDER', 'ADMIN', 'STAFF'].includes((session?.user as any).role);

    const fetchTicket = async () => {
        try {
            const res = await fetch(`/api/tickets/${id}`);
            if (res.ok) setTicket(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchTicket();
        const interval = setInterval(fetchTicket, 5000);
        return () => clearInterval(interval);
    }, [id]);

    useEffect(() => {
        if (isStaff) {
            fetch('/api/admin/users').then(res => res.json()).then(data => {
                const staff = data.filter((u: any) => ['FOUNDER', 'ADMIN', 'STAFF'].includes(u.role));
                setStaffMembers(staff);
            }).catch(console.error);
        }
    }, [isStaff]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [ticket?.messages]);

    const handleReply = async () => {
        if (!reply.trim()) return;
        setSending(true);
        try {
            await fetch(`/api/tickets/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: reply })
            });
            setReply('');
            await fetchTicket();
        } catch (e) {
            console.error(e);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await fetch(`/api/tickets/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: `Changed status to ${newStatus}`, newStatus })
            });
            await fetchTicket();
            toast.success(`Ticket ${newStatus.toLowerCase()}`);
        } catch (e) {
            console.error(e);
            toast.error('Failed to update status');
        }
    };

    const handleAssign = async (assignedToId: string | null) => {
        try {
            await fetch(`/api/tickets/${id}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignedToId })
            });
            await fetchTicket();
            toast.success('Assignee updated');
        } catch (e) {
            console.error(e);
            toast.error('Failed to assign');
        }
    };

    if (!ticket) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-3.5rem)] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/[0.05] bg-[#0a0a0a]/80 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/support"
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-400" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-lg font-semibold">{ticket.subject}</h1>
                                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${ticket.status === 'OPEN' ? 'bg-blue-500/10 text-blue-400' :
                                        ticket.status === 'ANSWERED' ? 'bg-green-500/10 text-green-400' :
                                            'bg-gray-500/10 text-gray-400'
                                    }`}>
                                    {ticket.status}
                                </span>
                                {(ticket.priority === 'URGENT' || ticket.priority === 'HIGH') && (
                                    <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-xs font-medium">
                                        {ticket.priority}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">
                                <span className="capitalize">{ticket.category}</span> • #{ticket.id.slice(-6)}
                                {ticket.assignedTo && <span> • Assigned to @{ticket.assignedTo.name}</span>}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isStaff && (
                            <select
                                value={ticket.assignedToId || ''}
                                onChange={(e) => handleAssign(e.target.value || null)}
                                className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                            >
                                <option value="">Unassigned</option>
                                {staffMembers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        )}

                        {ticket.status !== 'CLOSED' && isStaff && (
                            <button
                                onClick={() => handleStatusChange('CLOSED')}
                                className="h-9 px-4 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center gap-2"
                            >
                                <Lock className="h-4 w-4" />
                                Close
                            </button>
                        )}
                        {ticket.status === 'CLOSED' && isStaff && (
                            <button
                                onClick={() => handleStatusChange('OPEN')}
                                className="h-9 px-4 rounded-lg bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                            >
                                <Unlock className="h-4 w-4" />
                                Reopen
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto" ref={scrollRef}>
                <div className="max-w-4xl mx-auto p-6 space-y-6">
                    {ticket.messages.map((msg, idx) => {
                        const isMine = msg.sender.id === currentUserId;
                        const isStaffMsg = ['ADMIN', 'FOUNDER', 'STAFF'].includes(msg.sender.role);
                        const showDate = idx === 0 ||
                            new Date(msg.createdAt).toDateString() !== new Date(ticket.messages[idx - 1].createdAt).toDateString();

                        return (
                            <div key={msg.id}>
                                {showDate && (
                                    <div className="flex justify-center my-6">
                                        <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-500">
                                            {format(new Date(msg.createdAt), 'MMMM d, yyyy')}
                                        </span>
                                    </div>
                                )}
                                <div className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                                    {/* Avatar */}
                                    <div className={`h-9 w-9 rounded-full shrink-0 flex items-center justify-center text-sm font-medium ${isStaffMsg
                                            ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                                            : 'bg-white/10 text-gray-300'
                                        }`}>
                                        {msg.sender.name[0].toUpperCase()}
                                    </div>

                                    {/* Message */}
                                    <div className={`flex flex-col max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-gray-300">{msg.sender.name}</span>
                                            {msg.sender.role === 'FOUNDER' && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400">FOUNDER</span>
                                            )}
                                            {msg.sender.role === 'ADMIN' && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400">ADMIN</span>
                                            )}
                                            {msg.sender.role === 'STAFF' && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400">STAFF</span>
                                            )}
                                            <span className="text-xs text-gray-600">
                                                {format(new Date(msg.createdAt), 'h:mm a')}
                                            </span>
                                        </div>
                                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isMine
                                                ? 'bg-purple-500 text-white rounded-tr-md'
                                                : 'bg-white/5 text-gray-200 rounded-tl-md'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {ticket.status === 'CLOSED' && (
                        <div className="flex justify-center py-6">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-gray-400 text-sm">
                                <CheckCircle2 className="h-4 w-4" />
                                This ticket has been resolved
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input */}
            {ticket.status !== 'CLOSED' && (
                <div className="p-4 border-t border-white/[0.05] bg-[#0a0a0a]/80 backdrop-blur-xl">
                    <div className="max-w-4xl mx-auto flex gap-3">
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                                if (e.target.files?.[0]) {
                                    const file = e.target.files[0];
                                    setSending(true);
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    try {
                                        await fetch(`/api/tickets/${id}/upload`, {
                                            method: 'POST',
                                            body: formData
                                        });
                                        await fetchTicket();
                                        toast.success('Attachment uploaded');
                                    } catch (err) {
                                        toast.error('Failed to upload');
                                    } finally {
                                        setSending(false);
                                    }
                                }
                            }}
                        />
                        <label
                            htmlFor="file-upload"
                            className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors shrink-0"
                        >
                            <Paperclip className="h-5 w-5 text-gray-400" />
                        </label>
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleReply();
                                }
                            }}
                            className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 transition-all"
                        />
                        <button
                            onClick={handleReply}
                            disabled={sending || !reply.trim()}
                            className="h-12 w-12 rounded-xl bg-purple-500 text-white flex items-center justify-center hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
                        >
                            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
