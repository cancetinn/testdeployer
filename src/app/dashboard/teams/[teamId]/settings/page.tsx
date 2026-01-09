'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, Mail, Shield, Plus, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSession } from 'next-auth/react';

interface Member {
    id: string;
    userId: string;
    role: string;
    user: {
        name: string;
        email: string;
    };
    createdAt: string;
}

interface Invitation {
    id: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    inviter: {
        name: string;
    };
}

export default function TeamSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { data: session } = useSession();
    const teamId = params.teamId as string;

    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<Member[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);

    // Invite Dialog State
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviting, setInviting] = useState(false);

    const [updating, setUpdating] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`/api/teams/${teamId}/members`);
            if (!res.ok) throw new Error('Failed to fetch data');
            const data = await res.json();
            setMembers(data.members || []);
            setInvitations(data.invitations || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const currentUserMember = members.find(m => m.user.email === session?.user?.email);
    const canManage = currentUserMember?.role === 'OWNER' || currentUserMember?.role === 'ADMIN';

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;

        setInviting(true);
        try {
            const res = await fetch(`/api/teams/${teamId}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail })
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg);
            }

            toast({
                title: "Invitation Sent",
                description: `Invited ${inviteEmail}`,
            });
            setInviteEmail('');
            setInviteOpen(false);
            fetchData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setInviting(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        setUpdating(userId);
        try {
            const res = await fetch(`/api/teams/${teamId}/members/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            if (!res.ok) throw new Error('Failed');
            toast({ title: "Role Updated" });
            fetchData();
        } catch (error) {
            toast({ title: "Error", description: "Failed update", variant: "destructive" });
        } finally {
            setUpdating(null);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/teams/${teamId}/members/${userId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed');
            toast({ title: "Member Removed" });
            fetchData();
        } catch (error) {
            toast({ title: "Error", variant: "destructive" });
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-gray-500" /></div>;

    return (
        <div className="container mx-auto max-w-5xl py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 text-white">Team Management</h1>

            <Tabs defaultValue="members" className="w-full">
                <TabsList className="bg-[#1e1e1e] border border-white/10">
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="space-y-6 mt-6">
                    {/* Header & Invite */}
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium text-white">Team Members</h3>
                            <p className="text-sm text-gray-400">Manage who has access to this team.</p>
                        </div>

                        {canManage && (
                            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                                        <Plus className="mr-2 h-4 w-4" /> Invite Member
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-[#1e1e1e] border-white/10 text-white">
                                    <DialogHeader>
                                        <DialogTitle>Invite to Team</DialogTitle>
                                        <DialogDescription className="text-gray-400">
                                            Enter the email address of the person you want to invite.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleInvite} className="space-y-4 pt-4">
                                        <Input
                                            placeholder="email@example.com"
                                            type="email"
                                            value={inviteEmail}
                                            onChange={e => setInviteEmail(e.target.value)}
                                            className="bg-white/5 border-white/10"
                                            autoFocus
                                        />
                                        <DialogFooter>
                                            <Button type="submit" disabled={inviting || !inviteEmail} className="bg-purple-600 hover:bg-purple-700 text-white w-full">
                                                {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Send Invitation
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    {/* Members Table */}
                    <div className="rounded-md border border-white/10 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-[#1e1e1e]">
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-gray-400">User</TableHead>
                                    <TableHead className="text-gray-400">Role</TableHead>
                                    <TableHead className="text-gray-400">Joined</TableHead>
                                    <TableHead className="text-right text-gray-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.id} className="border-white/10 hover:bg-white/[0.02]">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 border border-white/10">
                                                    <AvatarFallback className="bg-[#2a2a2a] text-gray-300 text-xs">
                                                        {member.user.name ? member.user.name.substring(0, 2).toUpperCase() : 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-gray-200">{member.user.name || 'Unknown'}</div>
                                                    <div className="text-xs text-gray-500">{member.user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {canManage && member.role !== 'OWNER' && member.userId !== currentUserMember?.userId ? (
                                                <Select
                                                    defaultValue={member.role}
                                                    onValueChange={(val) => handleRoleChange(member.userId, val)}
                                                    disabled={updating === member.userId}
                                                >
                                                    <SelectTrigger className="w-[100px] h-7 text-xs bg-transparent border-white/20">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                                        <SelectItem value="MEMBER">Member</SelectItem>
                                                        <SelectItem value="VIEWER">Viewer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge variant="outline" className="border-white/20 text-gray-400 font-normal">
                                                    {member.role === 'OWNER' && <Shield className="mr-1 h-3 w-3 text-amber-500" />}
                                                    {member.role}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {new Date(member.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {canManage && member.role !== 'OWNER' && member.userId !== currentUserMember?.userId && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5 text-gray-400">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-[#1e1e1e] border-white/10 text-white">
                                                        <DropdownMenuItem
                                                            className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                                                            onClick={() => handleRemoveMember(member.userId)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Remove User
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pending Invitations */}
                    {invitations.length > 0 && (
                        <div className="pt-6">
                            <h3 className="text-md font-medium text-white mb-4">Pending Invitations</h3>
                            <div className="rounded-md border border-white/10 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-[#1e1e1e]">
                                        <TableRow className="border-white/10 hover:bg-transparent">
                                            <TableHead className="text-gray-400">Email</TableHead>
                                            <TableHead className="text-gray-400">Invited By</TableHead>
                                            <TableHead className="text-gray-400">Status</TableHead>
                                            <TableHead className="text-right text-gray-400">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invitations.map((inv) => (
                                            <TableRow key={inv.id} className="border-white/10 hover:bg-white/[0.02]">
                                                <TableCell className="text-gray-200">{inv.email}</TableCell>
                                                <TableCell className="text-gray-400">{inv.inviter?.name || 'Unknown'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/10 border-0">
                                                        Pending
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 h-8">
                                                        Revoke
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
                    <Card className="bg-[#1e1e1e] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">General Settings</CardTitle>
                            <CardDescription>Manage your team's public profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-200">Team Name</label>
                                <Input disabled value="Team Name Change (Coming Soon)" className="bg-white/5 border-white/10" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6 border border-red-500/20 rounded-lg p-6 bg-red-500/5">
                        <h3 className="text-red-400 font-medium mb-2">Danger Zone</h3>
                        <p className="text-sm text-gray-400 mb-4">Once you delete a team, there is no going back. Please be certain.</p>
                        <Button variant="destructive" className="bg-red-900/50 hover:bg-red-900 text-red-100 border border-red-500/20">
                            Delete Team
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
