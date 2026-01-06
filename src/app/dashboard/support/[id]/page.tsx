'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, ArrowLeft, Lock, Unlock, CheckCircle2, Paperclip } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    assignedToId?: string;
    assignedTo?: {
        name: string;
    };
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
                // Filter only staff/admin/founder
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
            toast.success('Reply sent successfully');
        } catch (e) {
            console.error(e);
            toast.error('Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        // Only accessible if staff effectively, but API protects it anyway.
        // Or if user wants to close their own ticket.
        try {
            await fetch(`/api/tickets/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: `Changed status to ${newStatus}`, newStatus })
            });
            await fetchTicket();
            toast.success(`Ticket status updated to ${newStatus}`);
        } catch (e) {
            console.error(e);
            toast.error('Failed to update status');
        }
    };

    if (!ticket) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col p-6 max-w-5xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/support">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            {ticket.subject}
                            <Badge variant={ticket.status === 'OPEN' ? 'default' : 'secondary'}>
                                {ticket.status}
                            </Badge>
                        </h2>
                        <p className="text-sm text-muted-foreground capitalize">
                            {ticket.category} Ticket • #{ticket.id.slice(-6)}
                        </p>
                        {ticket.assignedTo && !isStaff && (
                            <p className="text-xs text-primary/80 flex items-center gap-1 mt-1">
                                <span className="opacity-50">Assigned to:</span> {ticket.assignedTo.name}
                            </p>
                        )}
                        {isStaff && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">Assigned to:</span>
                                <Select
                                    defaultValue={ticket.assignedToId || "unassigned"}
                                    onValueChange={async (val) => {
                                        try {
                                            await fetch(`/api/tickets/${id}/assign`, {
                                                method: 'POST',
                                                body: JSON.stringify({ assignedToId: val === 'unassigned' ? null : val })
                                            });
                                            await fetchTicket();
                                            toast.success('Assignee updated');
                                        } catch (e) {
                                            console.error(e);
                                            toast.error('Failed to update assignee');
                                        }
                                    }}
                                >
                                    <SelectTrigger className="h-6 text-xs w-[140px] bg-background/50 border-white/10">
                                        <SelectValue placeholder="Unassigned" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {staffMembers.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </div>

                {ticket.status !== 'CLOSED' && isStaff && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusChange('CLOSED')} className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10">
                        <Lock className="h-3 w-3" /> Close Ticket
                    </Button>
                )}
                {ticket.status === 'CLOSED' && isStaff && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusChange('OPEN')} className="gap-2">
                        <Unlock className="h-3 w-3" /> Re-open Ticket
                    </Button>
                )}
            </div>

            <Card className="flex-1 flex flex-col min-h-0 bg-background/40 backdrop-blur-xl border-white/5">
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
                    {ticket.messages.map((msg) => {
                        const isStaff = ['ADMIN', 'FOUNDER', 'STAFF'].includes(msg.sender.role);
                        return (
                            <div key={msg.id} className={`flex gap-4 ${isStaff ? 'flex-row-reverse' : ''}`}>
                                <Avatar className="h-10 w-10 border border-white/10">
                                    <AvatarImage src={msg.sender.image} />
                                    <AvatarFallback className={isStaff ? 'bg-indigo-500/20 text-indigo-400' : ''}>
                                        {msg.sender.name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className={`flex flex-col max-w-[80%] ${isStaff ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold">{msg.sender.name}</span>
                                        {msg.sender.role === 'FOUNDER' && <Badge variant="destructive" className="text-[10px] h-4 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">FOUNDER</Badge>}
                                        {msg.sender.role === 'ADMIN' && <Badge className="text-[10px] h-4 bg-red-500/20 text-red-400 hover:bg-red-500/30">ADMIN</Badge>}
                                        {msg.sender.role === 'STAFF' && <Badge variant="secondary" className="text-[10px] h-4 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">STAFF</Badge>}
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${isStaff
                                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                        : 'bg-secondary/50 rounded-tl-sm'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {ticket.status === 'CLOSED' && (
                        <div className="flex justify-center py-4">
                            <Badge variant="outline" className="flex gap-2 py-2 px-4 bg-background/50">
                                <CheckCircle2 className="h-4 w-4" /> This ticket is closed.
                            </Badge>
                        </div>
                    )}
                </CardContent>

                {ticket.status !== 'CLOSED' && (
                    <CardFooter className="p-4 bg-background/50 border-t border-white/5">
                        <div className="flex gap-4 w-full">
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
                                            console.error(err);
                                            toast.error('Failed to upload attachment');
                                        }
                                        finally { setSending(false); }
                                    }
                                }}
                            />
                            <div className="flex gap-2 w-full">
                                <label htmlFor="file-upload">
                                    <div className="h-[60px] w-[50px] flex items-center justify-center border border-input rounded-md cursor-pointer hover:bg-secondary/50 transition-colors">
                                        <Paperclip className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                </label>
                                <Textarea
                                    placeholder="Type your reply..."
                                    className="min-h-[60px] resize-none"
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleReply();
                                        }
                                    }}
                                />
                                <Button
                                    size="icon"
                                    className="h-[60px] w-[60px]"
                                    onClick={handleReply}
                                    disabled={sending || !reply.trim()}
                                >
                                    {sending ? <Loader2 className="animate-spin" /> : <Send className="h-5 w-5" />}
                                </Button>
                            </div>
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
