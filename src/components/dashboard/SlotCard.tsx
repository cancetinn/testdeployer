'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BotSlot } from '@/lib/types';
import { Activity, Cpu, HardDrive, Play, Square, Settings } from 'lucide-react';

export function SlotCard({ slot }: { slot: BotSlot }) {
    const isOnline = slot.status === 'online';

    return (
        <Card className="hover:border-primary/50 transition-colors cursor-pointer group relative overflow-hidden">
            {/* Glow Effect */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${isOnline ? 'green' : 'red'}-500/10 rounded-full blur-[50px] -z-10 transition-colors`} />

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">{slot.name}</CardTitle>
                        <CardDescription className="text-xs font-mono">{slot.id}</CardDescription>
                    </div>
                    <Badge variant={isOnline ? 'default' : 'destructive'} className={isOnline ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}>
                        {slot.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-4 my-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Cpu className="h-4 w-4" />
                        <span>{slot.cpuUsage}% CPU</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <HardDrive className="h-4 w-4" />
                        <span>{slot.ramUsage}MB RAM</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
                        <Activity className="h-4 w-4" />
                        <span>Uptime: {Math.floor(slot.uptime / 3600)}h {(slot.uptime % 3600 / 60).toFixed(0)}m</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-2 flex gap-2">
                <Button size="sm" variant="outline" className="w-full h-8" asChild>
                    <Link href={`/dashboard/bot/${slot.id}`}>Manage</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
