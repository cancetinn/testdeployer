'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { ModeToggle } from '@/components/dashboard/ModeToggle';

export function Header() {
    return (
        <header className="h-16 border-b border-sidebar-border bg-background/50 backdrop-blur-xl flex items-center px-6 sticky top-0 z-50">
            <div className="md:hidden mr-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 border-r border-sidebar-border">
                        <Sidebar />
                    </SheetContent>
                </Sheet>
            </div>

            <div className="flex items-center gap-4 flex-1">
                <div className="relative max-w-md w-full hidden md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search bots, deployments..."
                        className="pl-9 bg-secondary/50 border-transparent focus-visible:bg-background focus-visible:border-ring transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <ModeToggle />
                <Button variant="ghost" size="icon" className="text-muted-foreground relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full" />
                </Button>
            </div>
        </header>
    );
}
