'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, Plus, Eye, EyeOff, Save } from 'lucide-react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
interface EnvVar {
    id: string;
    key: string;
    value: string;
}

export function EnvManager({ botId }: { botId: string }) {
    const [envs, setEnvs] = useState<EnvVar[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    const [error, setError] = useState('');

    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');

    const [showValues, setShowValues] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchEnvs();
    }, [botId]);

    const fetchEnvs = async () => {
        try {
            const res = await fetch(`/api/bots/${botId}/env`);
            if (res.ok) {
                const data = await res.json();
                setEnvs(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        const key = newKey.trim().toUpperCase();
        const value = newValue.trim();

        if (!key || !value) return;

        setError('');
        if (key === 'DISCORD_TOKEN') {
            if (value.length < 50) {
                setError('HATA: Girdiğin değer (~' + value.length + ' karakter) bir "Client Secret" gibi görünüyor. "DISCORD_TOKEN" için "Bot" sekmesinden "Reset Token" diyerek alacağın ~70 karakterlik "Token"ı girmelisin.');
                return;
            }
            if (!value.includes('.')) {
                setError('HATA: Token formatı hatalı. Discord Token\'ları nokta (.) ile ayrılmış 3 kısımdan oluşur (örn: xxxxx.yyyyy.zzzzz).');
                return;
            }
        }

        setAdding(true);
        try {
            const res = await fetch(`/api/bots/${botId}/env`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            });

            if (res.ok) {
                setNewKey('');
                setNewValue('');
                fetchEnvs();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (key: string) => {
        // Optimistic update
        setEnvs(prev => prev.filter(e => e.key !== key));

        try {
            await fetch(`/api/bots/${botId}/env?key=${key}`, { method: 'DELETE' });
        } catch (e) {
            console.error(e);
            fetchEnvs(); // Revert on error
        }
    };

    const toggleShow = (id: string) => {
        setShowValues(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading) return <div className="text-sm text-muted-foreground">Loading environment variables...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Environment Variables</h3>
                <p className="text-sm text-muted-foreground">
                    Manage the environment variables for your bot. These keys are injected at runtime.
                </p>
            </div>

            <Card className="bg-background/40 border-sidebar-border">
                <CardContent className="p-0">
                    {/* Add Form */}
                    <div className="p-4 border-b border-sidebar-border space-y-4 bg-muted/20">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="grid gap-1.5 flex-1">
                                <Label htmlFor="key" className="text-xs font-semibold text-muted-foreground uppercase">Key</Label>
                                <Input
                                    id="key"
                                    placeholder="DISCORD_TOKEN"
                                    value={newKey}
                                    onChange={(e) => setNewKey(e.target.value)}
                                    className="font-mono bg-background"
                                />
                            </div>
                            <div className="grid gap-1.5 flex-1">
                                <Label htmlFor="value" className="text-xs font-semibold text-muted-foreground uppercase">Value</Label>
                                <Input
                                    id="value"
                                    type="password"
                                    placeholder="Value"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    className="font-mono bg-background"
                                />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleAdd} disabled={adding || !newKey || !newValue}>
                                    {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                                </Button>
                            </div>
                        </div>
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 animate-in fade-in">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="relative w-full overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[30%]">Name</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {envs.map((env) => (
                                    <TableRow key={env.id}>
                                        <TableCell className="font-mono font-medium text-primary">
                                            {env.key}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 group">
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    {showValues[env.id] ? env.value : '••••••••••••••••'}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => toggleShow(env.id)}
                                                >
                                                    {showValues[env.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                onClick={() => handleDelete(env.key)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {envs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                            No environment variables defined.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
