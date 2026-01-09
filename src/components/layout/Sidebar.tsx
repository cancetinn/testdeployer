'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutDashboard, Plus, Settings, LogOut, Terminal, LifeBuoy, Shield, HardDrive, ChevronRight, Rocket } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSession, signOut } from 'next-auth/react';

const mainNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Rocket, label: 'My Bots', href: '/dashboard/bots' },
    { icon: Terminal, label: 'Deployments', href: '/dashboard/deployments' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user;
    const role = (session?.user as any)?.role;

    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : 'U';

    const isActive = (href: string) => pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-white/[0.08]">
            {/* Logo */}
            <div className="h-14 flex items-center px-6 border-b border-white/[0.05]">
                <Link href="/" className="flex items-center gap-2.5 font-semibold text-lg">
                    <div className="h-7 w-7 bg-gradient-to-br from-white to-gray-400 rounded-lg flex items-center justify-center text-black font-black text-sm shadow-lg shadow-white/10">
                        C
                    </div>
                    <span className="text-white">CANTEST</span>
                </Link>
            </div>

            <ScrollArea className="flex-1 py-4">
                {/* Main Navigation */}
                <div className="px-3 space-y-1">
                    <p className="px-3 mb-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                        Navigation
                    </p>
                    {mainNavItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                                isActive(item.href)
                                    ? 'bg-white/10 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            )}
                        >
                            <item.icon className={cn(
                                'h-4 w-4 transition-colors',
                                isActive(item.href) ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-300'
                            )} />
                            {item.label}
                            {isActive(item.href) && (
                                <ChevronRight className="h-4 w-4 ml-auto text-gray-600" />
                            )}
                        </Link>
                    ))}
                </div>

                {/* System Section */}
                <div className="px-3 mt-8 space-y-1">
                    <p className="px-3 mb-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                        System
                    </p>

                    <Link
                        href="/dashboard/support"
                        className={cn(
                            'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                            pathname?.startsWith('/dashboard/support')
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <LifeBuoy className="h-4 w-4 text-gray-500 group-hover:text-gray-300" />
                        Support
                    </Link>

                    <Link
                        href="/dashboard/settings"
                        className={cn(
                            'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                            pathname?.startsWith('/dashboard/settings')
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <Settings className="h-4 w-4 text-gray-500 group-hover:text-gray-300" />
                        Settings
                    </Link>

                    {/* Admin - Staff/Admin/Founder only */}
                    {role && ['FOUNDER', 'ADMIN', 'STAFF'].includes(role) && (
                        <Link
                            href="/dashboard/admin"
                            className={cn(
                                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                                pathname?.startsWith('/dashboard/admin')
                                    ? 'bg-purple-500/20 text-purple-300'
                                    : 'text-purple-400/70 hover:text-purple-300 hover:bg-purple-500/10'
                            )}
                        >
                            <Shield className="h-4 w-4" />
                            Admin Panel
                        </Link>
                    )}

                    {/* System - Founder only */}
                    {role === 'FOUNDER' && (
                        <Link
                            href="/dashboard/system"
                            className={cn(
                                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                                pathname?.startsWith('/dashboard/system')
                                    ? 'bg-red-500/20 text-red-300'
                                    : 'text-red-400/70 hover:text-red-300 hover:bg-red-500/10'
                            )}
                        >
                            <HardDrive className="h-4 w-4" />
                            System
                        </Link>
                    )}
                </div>

                {/* Quick Action */}
                <div className="px-3 mt-8">
                    <Link
                        href="/dashboard/new"
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 text-sm font-medium text-gray-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        New Project
                    </Link>
                </div>
            </ScrollArea>

            {/* User Section */}
            <div className="p-3 border-t border-white/[0.05]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <Avatar className="h-9 w-9 border border-white/10">
                                <AvatarImage src={user?.image || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-sm font-medium">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-white truncate">
                                    {user?.name || 'Loading...'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.email || '...'}
                                </p>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-[#111] border-white/10" align="end" side="right" sideOffset={10}>
                        <div className="px-2 py-1.5">
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings" className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                            className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                            onClick={() => signOut({ callbackUrl: '/' })}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
