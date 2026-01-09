'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Github, Upload, ArrowLeft, Archive, ArrowRight, Loader2, Terminal, Users, Lock, GitBranch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSession } from 'next-auth/react';

interface Team {
    id: string;
    name: string;
}

interface Repo {
    id: number;
    full_name: string;
    html_url: string;
    private: boolean;
    default_branch: string;
}

export default function NewProjectPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [selectedSource, setSelectedSource] = useState<'github' | 'upload' | null>(null);
    const [isDeploying, setIsDeploying] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<string>('personal');

    // GitHub State
    const [repos, setRepos] = useState<Repo[]>([]);
    const [selectedRepo, setSelectedRepo] = useState<string>('');
    const [loadingRepos, setLoadingRepos] = useState(false);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await fetch('/api/teams');
                if (res.ok) {
                    const data = await res.json();
                    setTeams(data);
                }
            } catch (error) {
                console.error("Failed to fetch teams", error);
            }
        };
        fetchTeams();
    }, []);

    useEffect(() => {
        if (selectedSource === 'github' && (session as any)?.accessToken) {
            const fetchRepos = async () => {
                setLoadingRepos(true);
                try {
                    const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
                        headers: {
                            Authorization: `Bearer ${(session as any).accessToken}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setRepos(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch repos", error);
                } finally {
                    setLoadingRepos(false);
                }
            };
            fetchRepos();
        }
    }, [selectedSource, session]);

    const handleDeploy = async () => {
        setIsDeploying(true);
        setStatusMessage('Creating bot slot...');

        try {
            // 1. Create Bot Slot in DB
            const projectNameInput = document.getElementById('name') as HTMLInputElement;
            let projectName = projectNameInput?.value;
            let repoUrl = '';

            if (selectedSource === 'github') {
                if (!selectedRepo) throw new Error("Please select a repository");
                const repo = repos.find(r => r.id.toString() === selectedRepo);
                if (repo) {
                    repoUrl = repo.html_url; // We'll pass html_url for display, but clone_url might be needed backend. Actually POST route handles cloning.
                    if (!projectName) projectName = repo.full_name.split('/')[1];
                }
            } else {
                projectName = projectName || "My Bot";
            }

            const res = await fetch('/api/bots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: projectName,
                    description: 'Imported from ' + selectedSource,
                    teamId: selectedTeam !== 'personal' ? selectedTeam : undefined,
                    repoUrl: repoUrl
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

    const TeamSelector = () => (
        <div className="space-y-2">
            <Label htmlFor="team-select">Team (Optional)</Label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-full bg-background/50">
                    <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="personal">
                        <span className="flex items-center gap-2">
                            <Users className="h-4 w-4" /> Personal Project
                        </span>
                    </SelectItem>
                    {teams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                            {team.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
                Personal projects are private. Team projects are shared with all team members.
            </p>
        </div>
    );

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
                            <Label>Select Repository</Label>
                            {!(session as any)?.accessToken ? (
                                <div className="border border-dashed border-red-500/50 rounded-lg p-6 text-center bg-red-500/5">
                                    <Github className="h-8 w-8 mx-auto mb-2 text-red-400" />
                                    <h3 className="font-semibold mb-1">GitHub Not Connected</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Connect your GitHub account to access your repositories.</p>
                                    <Link href="/dashboard/integrations">
                                        <Button size="sm">Connect GitHub</Button>
                                    </Link>
                                </div>
                            ) : loadingRepos ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 border rounded-lg bg-background/50">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Fetching repositories...
                                </div>
                            ) : (
                                <div className="relative">
                                    <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                                        <SelectTrigger className="w-full bg-background/50">
                                            <SelectValue placeholder="Select a repository" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            {repos.map(repo => (
                                                <SelectItem key={repo.id} value={repo.id.toString()}>
                                                    <span className="flex items-center gap-2">
                                                        {repo.private ? <Lock className="h-3 w-3 text-amber-500" /> : <Github className="h-3 w-3 opacity-50" />}
                                                        <span>{repo.full_name}</span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                            {repos.length === 0 && <div className="p-2 text-sm text-muted-foreground text-center">No repositories found</div>}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                className="bg-background/50"
                                placeholder="My Awesome Bot"
                                defaultValue={repos.find(r => r.id.toString() === selectedRepo)?.full_name.split('/')[1] || ''}
                            />
                        </div>
                        <TeamSelector />
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleDeploy} disabled={isDeploying || !selectedRepo}>
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
                        <TeamSelector />
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
