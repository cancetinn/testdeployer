'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    data?: string;
}

export function Header() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { toast } = useToast();

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAllRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'MARK_ALL_READ' })
            });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error(error);
        }
    };

    const handleInviteResponse = async (notification: Notification, action: 'ACCEPT' | 'DECLINE') => {
        try {
            const data = notification.data ? JSON.parse(notification.data) : {};
            const invitationId = data.invitationId;

            if (!invitationId) return;

            const res = await fetch(`/api/invitations/${invitationId}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });

            if (res.ok) {
                toast({
                    title: `Invitation ${action === 'ACCEPT' ? 'Accepted' : 'Declined'}`,
                    description: action === 'ACCEPT' ? 'You have joined the team.' : 'Invitation declined.',
                });

                // Mark notification as read
                await fetch('/api/notifications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: notification.id })
                });

                fetchNotifications();
                // Optionally reload page to update sidebar teams list
                if (action === 'ACCEPT') {
                    window.location.reload();
                }
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to process invitation", variant: "destructive" });
        }
    };

    return (
        <header className="h-14 border-b border-white/[0.05] bg-[#0a0a0a]/80 backdrop-blur-xl flex items-center px-6 sticky top-0 z-50">
            {/* Mobile Menu */}
            <div className="md:hidden mr-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <Menu className="h-5 w-5 text-gray-400" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 bg-[#0a0a0a] border-white/[0.08]">
                        <Sidebar />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Search */}
            <div className="flex-1 flex items-center gap-4">
                <div className="relative max-w-md w-full hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full h-9 pl-9 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 transition-all"
                    />
                    <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-gray-500">
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors focus:outline-none">
                            <Bell className="h-5 w-5 text-gray-400" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-purple-500 rounded-full ring-2 ring-[#0a0a0a]" />
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 bg-[#1e1e1e] border-white/10 text-white p-0">
                        <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center bg-[#1e1e1e]">
                            <h3 className="font-semibold text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-xs text-purple-400 hover:text-purple-300"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <ScrollArea className="h-[300px]">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    No notifications
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map((n) => (
                                        <div key={n.id} className={`p-4 ${!n.read ? 'bg-white/[0.02]' : ''}`}>
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <h4 className="text-sm font-medium">{n.title}</h4>
                                                <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                                    {new Date(n.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                                                {n.message}
                                            </p>

                                            {n.type === 'TEAM_INVITE' && !n.read && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                                                        onClick={() => handleInviteResponse(n, 'ACCEPT')}
                                                    >
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-xs border-white/10 text-gray-400 hover:text-white"
                                                        onClick={() => handleInviteResponse(n, 'DECLINE')}
                                                    >
                                                        Decline
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
