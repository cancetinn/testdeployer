'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutDashboard, Plus, Settings, LogOut, Box, Terminal, LifeBuoy, Shield, HardDrive } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSession, signOut } from 'next-auth/react';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: Box, label: 'My Bots', href: '/dashboard' },
    { icon: Terminal, label: 'Deployments', href: '/dashboard/deployments' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user;

    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : 'U';

    return (
        <div className="flex flex-col h-full border-r border-sidebar-border bg-sidebar/50 backdrop-blur-xl">
            <div className="p-6">
                <div className="flex items-center gap-2 font-bold text-xl text-primary">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-black shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                        C
                    </div>
                    <span className="tracking-tight">CANTEST</span>
                </div>
            </div>

            <ScrollArea className="flex-1 px-4">
                <div className="space-y-2">
                    {sidebarItems.map((item) => (
                        <Button
                            key={item.label}
                            variant={pathname === item.href ? 'secondary' : 'ghost'}
                            className={cn(
                                'w-full justify-start gap-3',
                                pathname === item.href && 'bg-primary/10 text-primary hover:bg-primary/20'
                            )}
                            asChild
                        >
                            <Link href={item.href}>
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        </Button>
                    ))}
                </div>



                <div className="mt-6 space-y-2">
                    <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        System
                    </p>
                    {/* Support Link - Visible to Everyone */}
                    <Button variant={pathname === '/dashboard/support' ? 'secondary' : 'ghost'} className="w-full justify-start gap-3" asChild>
                        <Link href="/dashboard/support">
                            <LifeBuoy className="h-4 w-4" />
                            Help & Support
                        </Link>
                    </Button>

                    {/* Admin Link - Visible only to Staff/Admin/Founder */}
                    {(session?.user as any)?.role && ['FOUNDER', 'ADMIN', 'STAFF'].includes((session?.user as any).role) && (
                        <Button variant={pathname?.startsWith('/dashboard/admin') ? 'secondary' : 'ghost'} className="w-full justify-start gap-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10" asChild>
                            <Link href="/dashboard/admin">
                                <Shield className="h-4 w-4" />
                                Admin Panel
                            </Link>
                        </Button>
                    )}

                    {/* System Link - Visible only to Founder */}
                    {(session?.user as any)?.role === 'FOUNDER' && (
                        <Button variant={pathname?.startsWith('/dashboard/system') ? 'secondary' : 'ghost'} className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10" asChild>
                            <Link href="/dashboard/system">
                                <HardDrive className="h-4 w-4" />
                                System Internals
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="mt-8">
                    <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Quick Actions
                    </h3>
                    <Button variant="outline" className="w-full justify-start gap-3 border-dashed hover:bg-background/80" asChild>
                        <Link href="/dashboard/new">
                            <Plus className="h-4 w-4" />
                            New Bot
                        </Link>
                    </Button>
                </div>
            </ScrollArea >

            <div className="p-4 mt-auto border-t border-sidebar-border">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full h-auto p-2 flex items-center gap-3 hover:bg-background/40 transition-colors justify-start" size="lg">
                            <Avatar className="h-9 w-9 border border-border">
                                <AvatarImage src={user?.image || "/placeholder-user.jpg"} alt={user?.name || "User"} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium leading-none truncate">
                                    {user?.name || 'Loading...'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user?.email || '...'}
                                </p>
                            </div>
                            <Settings className="h-4 w-4 text-muted-foreground ml-auto" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-background/95 backdrop-blur-xl" align="end" side="right" sideOffset={10}>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings" className="cursor-pointer flex w-full items-center">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => signOut({ callbackUrl: '/' })}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div >
    );
}
