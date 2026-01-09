'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CreateTeamDialog } from '@/components/teams/CreateTeamDialog';
import { Plus, Search, Users, Settings, Briefcase, Loader2, AlertCircle } from 'lucide-react';

interface Team {
    id: string;
    name: string;
    slug: string;
    memberCount: number;
}

export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const fetchTeams = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/teams');
            if (res.ok) {
                const data = await res.json();
                setTeams(data);
            } else {
                const text = await res.text();
                setError(`Failed to load teams (${res.status}): ${text}`);
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const filteredTeams = teams.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container mx-auto max-w-6xl py-10 px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Teams</h1>
                    <p className="text-gray-400 mt-1">Manage your workspaces and collaborations.</p>
                </div>
                <CreateTeamDialog onTeamCreated={fetchTeams}>
                    <Button className="bg-white text-black hover:bg-gray-200">
                        <Plus className="mr-2 h-4 w-4" /> Create Team
                    </Button>
                </CreateTeamDialog>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 rounded-md bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Valid Content */}
            {!loading && !error && filteredTeams.length > 0 && (
                <div className="space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search teams..."
                            className="bg-[#1e1e1e] border-white/10 pl-9 max-w-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeams.map((team) => (
                            <Link key={team.id} href={`/dashboard/teams/${team.id}/settings`} className="block group">
                                <Card className="bg-[#1e1e1e] border-white/10 hover:border-purple-500/50 transition-colors h-full">
                                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                        <Avatar className="h-10 w-10 border border-white/10">
                                            <AvatarFallback className="bg-[#2a2a2a] text-white">
                                                {team.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-lg text-white group-hover:text-purple-400 transition-colors">
                                                {team.name}
                                            </CardTitle>
                                            <CardDescription className="font-mono text-xs">
                                                @{team.slug}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center text-sm text-gray-400 mt-2">
                                            <Users className="mr-2 h-4 w-4" />
                                            {team.memberCount} Member{team.memberCount !== 1 ? 's' : ''}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0">
                                        <Button variant="outline" size="sm" className="w-full text-xs bg-transparent border-white/10 text-gray-400 group-hover:text-white group-hover:bg-white/5">
                                            <Settings className="mr-2 h-3.5 w-3.5" /> Manage Settings
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredTeams.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-lg bg-white/[0.02]">
                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Briefcase className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No teams found</h3>
                    <p className="text-gray-400 max-w-sm text-center mb-6">
                        {search ? 'Try adjusting your search terms.' : 'Create a team to start collaborating with others on your bots.'}
                    </p>
                    {!search && (
                        <CreateTeamDialog onTeamCreated={fetchTeams}>
                            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                                Create your first team
                            </Button>
                        </CreateTeamDialog>
                    )}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
            )}
        </div>
    );
}
