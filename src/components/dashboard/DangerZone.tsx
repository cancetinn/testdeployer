'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DangerZone({ botId, botName }: { botId: string, botName: string }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmName, setConfirmName] = useState('');

    const handleDelete = async () => {
        if (confirmName !== botName) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/bots/${botId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                router.push('/dashboard');
            } else {
                alert("Failed to delete bot");
                setIsDeleting(false);
            }
        } catch (e) {
            console.error(e);
            setIsDeleting(false);
        }
    };

    return (
        <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" /> Danger Zone
                </CardTitle>
                <CardDescription>
                    Irreversible actions for your bot.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-destructive/20">
                    <div>
                        <h4 className="font-semibold text-foreground">Delete Project</h4>
                        <p className="text-sm text-muted-foreground">
                            This will permanently delete your bot, its deployments, and all environment variables.
                        </p>
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Delete Bot</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the
                                    bot <strong>{botName}</strong> and remove all associated data.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <div className="py-4">
                                <Label htmlFor="confirm">Type <strong>{botName}</strong> to confirm:</Label>
                                <Input
                                    id="confirm"
                                    value={confirmName}
                                    onChange={(e) => setConfirmName(e.target.value)}
                                    className="mt-2"
                                    placeholder={botName}
                                />
                            </div>

                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={confirmName !== botName || isDeleting}
                                >
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Bot"}
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}
