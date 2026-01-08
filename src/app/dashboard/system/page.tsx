'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Folder, File, Database, HardDrive, ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function SystemDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        if (status === 'loading') return;

        const userRole = (session?.user as any)?.role;
        if (userRole !== 'FOUNDER') {
            setAuthorized(false);
            toast.error('Access Denied: FOUNDER only');
            router.replace('/dashboard');
        } else {
            setAuthorized(true);
        }
    }, [session, status, router]);

    // Loading state
    if (status === 'loading' || authorized === null) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Unauthorized state (briefly shown before redirect)
    if (!authorized) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
                <ShieldAlert className="h-16 w-16 text-destructive" />
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p className="text-muted-foreground">This page is restricted to FOUNDER role only.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-red-500 flex items-center gap-3">
                        <HardDrive className="h-8 w-8" />
                        System Internals
                    </h2>
                    <p className="text-muted-foreground">Founder-only access to filesystem and database.</p>
                </div>
            </div>

            <Tabs defaultValue="db" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="db" className="gap-2"><Database className="h-4 w-4" /> Database</TabsTrigger>
                    <TabsTrigger value="files" className="gap-2"><Folder className="h-4 w-4" /> File Manager</TabsTrigger>
                </TabsList>

                <TabsContent value="db">
                    <DatabaseViewer />
                </TabsContent>

                <TabsContent value="files">
                    <FileManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function DatabaseViewer() {
    const [model, setModel] = useState<string>('');
    const [models, setModels] = useState<string[]>([]);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        fetch('/api/system/db').then(res => res.json()).then(res => {
            setModels(res.models || []);
            if (res.models?.length > 0) setModel(res.models[0]);
        });
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (!model) return;
        setLoading(true);
        fetch(`/api/system/db?model=${model}&search=${debouncedSearch}`)
            .then(res => res.json())
            .then(res => setData(res.data || []))
            .catch(() => toast.error('Failed to load data'))
            .finally(() => setLoading(false));
    }, [model, debouncedSearch]);

    const handleUpdate = async (id: string, field: string, value: any) => {
        try {
            const res = await fetch('/api/system/db', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model, id, data: { [field]: value } })
            });
            if (res.ok) {
                toast.success('Updated record');
            } else {
                toast.error('Update failed');
            }
        } catch {
            toast.error('Update error');
        }
    };

    return (
        <Card className="bg-background/40 backdrop-blur-xl border-white/5">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <CardTitle>Database Records</CardTitle>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-[200px] bg-background/50"
                    />
                    <Select value={model} onValueChange={setModel}>
                        <SelectTrigger className="w-[180px] bg-background/50">
                            <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                        <SelectContent>
                            {models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                ) : (
                    <div className="rounded-md border border-white/10 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-white/10">
                                    {data.length > 0 && Object.keys(data[0]).slice(0, 8).map(key => (
                                        <TableHead key={key} className="whitespace-nowrap">{key}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row, i) => (
                                    <TableRow key={i} className="hover:bg-white/5 border-white/5">
                                        {Object.entries(row).slice(0, 8).map(([key, value]: any) => (
                                            <TableCell key={key} className="whitespace-nowrap font-mono text-xs max-w-[200px]">
                                                {(typeof value === 'string' || typeof value === 'number') && key !== 'id' && !key.endsWith('Id') ? (
                                                    <input
                                                        className="bg-transparent border-transparent hover:border-white/20 border rounded px-1 w-full focus:bg-black focus:border-primary outline-none transition-colors"
                                                        defaultValue={value}
                                                        onBlur={(e) => {
                                                            if (e.target.value != value) handleUpdate(row.id, key, e.target.value);
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="truncate block" title={String(value)}>
                                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                    </span>
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                                {data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No records found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function FileManager() {
    const [path, setPath] = useState('/');
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadPath = (newPath: string) => {
        setLoading(true);
        fetch(`/api/system/files?path=${newPath}`)
            .then(res => res.json())
            .then(res => {
                setPath(res.path);
                setFiles(res.files);
            })
            .catch(() => toast.error('Failed to load path'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadPath('/');
    }, []);

    const goUp = () => {
        const parts = path.split('/').filter(Boolean);
        parts.pop();
        loadPath('/' + parts.join('/'));
    };

    return (
        <Card className="bg-background/40 backdrop-blur-xl border-white/5">
            <CardHeader className="flex flex-row items-center gap-4">
                <Button variant="outline" size="icon" onClick={goUp} disabled={path === '/'}><ArrowLeft className="h-4 w-4" /></Button>
                <div className="font-mono text-sm bg-background/50 px-3 py-1.5 rounded-md flex-1 border border-white/10">
                    {path}
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {files.map(file => (
                            <div
                                key={file.name}
                                className={`
                                    p-3 rounded-lg border border-white/5 flex flex-col items-center gap-2 text-center cursor-pointer transition-colors
                                    ${file.isDirectory ? 'bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/20' : 'bg-background/30 hover:bg-white/5'}
                                `}
                                onClick={() => file.isDirectory && loadPath((path === '/' ? '' : path) + '/' + file.name)}
                            >
                                {file.isDirectory ? (
                                    <Folder className="h-8 w-8 text-blue-400" />
                                ) : (
                                    <File className="h-8 w-8 text-gray-400" />
                                )}
                                <div className="w-full">
                                    <div className="text-sm font-medium truncate w-full" title={file.name}>{file.name}</div>
                                    <div className="text-[10px] text-muted-foreground">
                                        {formatBytes(file.size)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
