'use client';

import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
    const { data: session } = useSession();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>
                            Your personal information and account settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={session?.user?.image || ''} />
                                <AvatarFallback className="text-xl bg-primary/20 text-primary">
                                    {session?.user?.name?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-semibold text-lg">{session?.user?.name}</h3>
                                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                            </div>
                        </div>

                        <div className="grid gap-2 max-w-md">
                            <Label>Display Name</Label>
                            <Input defaultValue={session?.user?.name || ''} disabled />
                            <p className="text-xs text-muted-foreground">Managed by your authentication provider.</p>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => signOut()}>
                                Sign Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Preferences</CardTitle>
                        <CardDescription>Manage your dashboard appearance and notifications (Coming Soon).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 opacity-50 pointer-events-none">
                        <div className="flex justify-between items-center bg-secondary/10 p-3 rounded-lg">
                            <div>
                                <div className="font-semibold text-sm">Email Notifications</div>
                                <div className="text-xs text-muted-foreground">Receive updates about your bot status.</div>
                            </div>
                            <Button variant="outline" size="sm">Enable</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
