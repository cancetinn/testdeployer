'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Search, Shield, ShieldAlert, UserCog, Users, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Types
interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    _count: { bots: number; tickets: number; };
}

interface Ticket {
    id: string;
    subject: string;
    category: string;
    status: string;
    priority: string;
    updatedAt: string;
    author: { name: string, email: string };
    assignedTo?: { name: string };
}

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const [activeTab, setActiveTab] = useState('tickets');

    // Confirmation State
    const [roleDialog, setRoleDialog] = useState<{ open: boolean; userId: string; newRole: string; userName: string } | null>(null);

    // Data State
    const [users, setUsers] = useState<User[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [userSearch, setUserSearch] = useState('');
    const [ticketFilter, setTicketFilter] = useState('ALL');

    // Authorization check
    useEffect(() => {
        if (status === 'loading') return;

        const userRole = (session?.user as any)?.role;
        const allowedRoles = ['FOUNDER', 'ADMIN', 'STAFF'];

        if (!userRole || !allowedRoles.includes(userRole)) {
            setAuthorized(false);
            toast.error('Access Denied: Staff access required');
            router.replace('/dashboard');
        } else {
            setAuthorized(true);
        }
    }, [session, status, router]);

    useEffect(() => {
        if (authorized) {
            fetchData();
        }
    }, [authorized]);

    const fetchData = async () => {
        try {
            const [usersRes, ticketsRes] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/tickets?scope=all')
            ]);

            if (usersRes.ok) setUsers(await usersRes.json());
            if (ticketsRes.ok) setTickets(await ticketsRes.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // User Helpers
    const initiateRoleUpdate = (userId: string, newRole: string, userName: string) => {
        setRoleDialog({ open: true, userId, newRole, userName });
    };

    const confirmRoleUpdate = async () => {
        if (!roleDialog) return;

        try {
            const res = await fetch(`/api/admin/users/${roleDialog.userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: roleDialog.newRole })
            });

            if (res.ok) {
                setUsers(users.map(u => u.id === roleDialog.userId ? { ...u, role: roleDialog.newRole } : u));
                toast.success(`Role updated to ${roleDialog.newRole} for ${roleDialog.userName}`);
            } else {
                toast.error('Failed to update role');
            }
        } catch (e) {
            console.error(e);
            toast.error('An error occurred');
        } finally {
            setRoleDialog(null);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'FOUNDER': return <Badge variant="destructive" className="bg-purple-500/10 text-purple-500 border-purple-500/20">FOUNDER</Badge>;
            case 'ADMIN': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">ADMIN</Badge>;
            case 'STAFF': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">STAFF</Badge>;
            default: return <Badge variant="secondary" className="bg-gray-500/10 text-gray-500">USER</Badge>;
        }
    };

    // Ticket Helpers
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'text-blue-500 border-blue-500/30';
            case 'ANSWERED': return 'text-green-500 border-green-500/30';
            case 'CLOSED': return 'text-gray-500 border-gray-500/30';
            default: return '';
        }
    };

    const filteredTickets = tickets.filter(t =>
        ticketFilter === 'ALL' || t.status === ticketFilter
    );

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    // Loading state
    if (status === 'loading' || authorized === null) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Unauthorized state (briefly shown before redirect)
    if (!authorized) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
                <ShieldAlert className="h-16 w-16 text-destructive" />
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p className="text-muted-foreground">This page requires Staff, Admin, or Founder privileges.</p>
            </div>
        );
    }

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                    <p className="text-muted-foreground">Manage users, roles, and support tickets.</p>
                </div>
            </div>

            <Tabs defaultValue="tickets" className="space-y-4" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
                    <TabsTrigger value="users">User Management</TabsTrigger>
                </TabsList>

                {/* TICKETS TAB */}
                <TabsContent value="tickets" className="space-y-4">
                    <div className="flex gap-2">
                        {['ALL', 'OPEN', 'ANSWERED', 'CLOSED'].map(status => (
                            <Button
                                key={status}
                                variant={ticketFilter === status ? 'default' : 'outline'}
                                onClick={() => setTicketFilter(status)}
                                size="sm"
                            >
                                {status}
                            </Button>
                        ))}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredTickets.map(ticket => (
                            <Link key={ticket.id} href={`/dashboard/support/${ticket.id}`}>
                                <Card className="hover:bg-white/5 transition-colors cursor-pointer border-white/10">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium truncate pr-4">
                                            {ticket.subject}
                                        </CardTitle>
                                        <Badge variant="outline" className={getStatusColor(ticket.status)}>
                                            {ticket.status}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xs text-muted-foreground mb-4">
                                            {ticket.category} • {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback>{ticket.author.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-muted-foreground">{ticket.author.name}</span>
                                            </div>
                                            {ticket.assignedTo ? (
                                                <span className="text-primary/80">Agent: {ticket.assignedTo.name}</span>
                                            ) : (
                                                <span className="text-yellow-500/80">Unassigned</span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                        {filteredTickets.length === 0 && (
                            <div className="col-span-full text-center py-10 text-muted-foreground">
                                No tickets found.
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* USERS TAB */}
                <TabsContent value="users">
                    <Card className="bg-background/40 backdrop-blur-xl border-white/5">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>All Users ({users.length})</CardTitle>
                                <div className="relative w-72">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search users..."
                                        className="pl-9 bg-background/50"
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Stats</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-white/5 border-white/5">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={`https://avatar.vercel.sh/${user.id}`} />
                                                        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2 text-xs text-muted-foreground">
                                                    <span>{user._count.bots} Bots</span>
                                                    <span>{user._count.tickets} Tickets</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Select defaultValue={user.role} onValueChange={(v) => initiateRoleUpdate(user.id, v, user.name)}>
                                                    <SelectTrigger className="w-[110px] h-8 ml-auto bg-background/50">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="USER">User</SelectItem>
                                                        <SelectItem value="STAFF">Staff</SelectItem>
                                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                                        <SelectItem value="FOUNDER">Founder</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <AlertDialog open={!!roleDialog} onOpenChange={(open) => !open && setRoleDialog(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change User Role?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to change <b>{roleDialog?.userName}</b>'s role to <b className="text-primary">{roleDialog?.newRole}</b>?
                            This will affect their access permissions immediately.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRoleUpdate}>Confirm Change</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
