'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TerminalProps {
    logs: string[];
    className?: string;
    onClear?: () => void;
}

export function Terminal({ logs, className, onClear }: TerminalProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll to bottom
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [logs]);

    return (
        <div className={cn("bg-black rounded-lg border border-border overflow-hidden font-mono text-xs", className)}>
            <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                    </div>
                    <span className="ml-2 text-muted-foreground">can@deployer:~</span>
                </div>
                {onClear && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={onClear} title="Clear Console">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>
            <ScrollArea className="h-[300px] w-full p-4" ref={scrollRef}>
                <div className="space-y-1">
                    {logs.map((log, i) => (
                        <div key={i} className="break-all text-slate-300">
                            <span className="text-muted-foreground mr-2 opacity-50">$</span>
                            {log}
                        </div>
                    ))}
                    <div className="animate-pulse inline-block w-2 h-4 bg-primary align-middle ml-1" />
                </div>
            </ScrollArea>
        </div>
    );
}
