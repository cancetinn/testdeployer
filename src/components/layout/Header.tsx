'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';

export function Header() {
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
                <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Bell className="h-5 w-5 text-gray-400" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-purple-500 rounded-full ring-2 ring-[#0a0a0a]" />
                </button>
            </div>
        </header>
    );
}
