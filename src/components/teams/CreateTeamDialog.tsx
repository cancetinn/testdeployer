'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface CreateTeamDialogProps {
    onTeamCreated?: () => void;
    children?: React.ReactNode;
}

export function CreateTeamDialog({ onTeamCreated, children }: CreateTeamDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            if (!res.ok) throw new Error('Failed to create team');

            const team = await res.json();

            toast({
                title: "Team created!",
                description: `You are now the owner of ${team.name}`,
            });

            setOpen(false);
            setName('');
            router.refresh();
            if (onTeamCreated) onTeamCreated();

        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Team
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#1e1e1e] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Create a Team</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Teams allow you to collaborate on bots, share resources, and manage access rights.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Team Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Acme Corp"
                            className="bg-white/5 border-white/10"
                            autoFocus
                        />
                    </div>
                </form>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading} className="text-gray-400 hover:text-white">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !name.trim()} className="bg-purple-600 hover:bg-purple-700 text-white">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Team
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
