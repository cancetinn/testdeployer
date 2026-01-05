'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Github, Upload, ArrowLeft, Archive, ArrowRight, Loader2, Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function NewProjectPage() {
    const router = useRouter();
    const [selectedSource, setSelectedSource] = useState<'github' | 'upload' | null>(null);
    const [isDeploying, setIsDeploying] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const matchGithubUrl = (url: string) => {
        const regex = /^https:\/\/github\.com\/([\w-]+\/[\w-]+)(\/)?$/;
        return regex.test(url);
    };

    const handleDeploy = async () => {
        setIsDeploying(true);
        setStatusMessage('Creating bot slot...');

        try {
            // 1. Create Bot Slot in DB
            const projectNameInput = document.getElementById('name') as HTMLInputElement;
            const projectName = projectNameInput?.value || "My Bot";

            const res = await fetch('/api/bots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: projectName,
                    description: 'Imported from ' + selectedSource
                })
            });

            if (!res.ok) throw new Error("Failed to create bot slot");

            const bot = await res.json();
            const botId = bot.id;

            // 2. Upload Code if source is 'upload'
            if (selectedSource === 'upload' && selectedFile) {
                setStatusMessage('Uploading and extracting code...');
                const formData = new FormData();
                formData.append('file', selectedFile);

                const uploadRes = await fetch(`/api/bots/${botId}/upload`, {
                    method: 'POST',
                    body: formData
                });

                if (!uploadRes.ok) throw new Error("Failed to upload code");
            }

            // 3. Finish
            setStatusMessage('Finalizing...');
            setTimeout(() => {
                setIsDeploying(false);
                router.push(`/dashboard/bot/${botId}`);
            }, 1000);

        } catch (error: any) {
            console.error(error);
            setStatusMessage('Error: ' + error.message);
            setTimeout(() => setIsDeploying(false), 2000);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {!selectedSource && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <Card
                        className="cursor-pointer hover:border-primary hover:bg-muted/50 transition-all group"
                        onClick={() => setSelectedSource('upload')}
                    >
                        <CardContent className="flex flex-col items-center justify-center p-10 text-center space-y-4">
                            <div className="p-4 rounded-full bg-secondary group-hover:bg-primary/20 transition-colors">
                                <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Upload Zip</h3>
                                <p className="text-sm text-muted-foreground">Deploy from a .zip archive</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:border-primary hover:bg-muted/50 transition-all group"
                        onClick={() => setSelectedSource('github')}
                    >
                        <CardContent className="flex flex-col items-center justify-center p-10 text-center space-y-4">
                            <div className="p-4 rounded-full bg-secondary group-hover:bg-primary/20 transition-colors">
                                <Github className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Import Git</h3>
                                <p className="text-sm text-muted-foreground">Connect a GitHub repository</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {selectedSource && (
                <div className="mb-4">
                    <Button variant="ghost" onClick={() => setSelectedSource(null)} className="gap-2 pl-0">
                        <ArrowLeft className="h-4 w-4" /> Back to selection
                    </Button>
                </div>
            )}

            {selectedSource === 'github' && (
                <Card className="border-sidebar-border bg-sidebar/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="gh-url">Repository URL</Label>
                            <div className="relative">
                                <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input id="gh-url" className="pl-9 bg-background/50" placeholder="https://github.com/username/repo" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input id="name" className="bg-background/50" placeholder="My Awesome Bot" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleDeploy} disabled={isDeploying}>
                            {isDeploying ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {statusMessage}
                                </>
                            ) : (
                                <>
                                    Deploy
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {selectedSource === 'upload' && (
                <Card className="border-sidebar-border bg-sidebar/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardContent className="pt-6 space-y-4">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 text-center hover:border-primary/50 hover:bg-muted/50 transition-colors">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept=".zip"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setSelectedFile(e.target.files[0]);
                                    }
                                }}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                <Archive className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm font-medium">
                                    {selectedFile ? selectedFile.name : "Click to select .zip file"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Max size: 50MB
                                </p>
                            </label>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input id="name" className="bg-background/50" placeholder="My Awesome Bot" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleDeploy} disabled={isDeploying || !selectedFile}>
                            {isDeploying ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {statusMessage}
                                </>
                            ) : (
                                <>
                                    Deploy
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            )}

        </div>
    );
}
