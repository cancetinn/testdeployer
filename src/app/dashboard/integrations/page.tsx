'use client';

import { Github, GitBranch, AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { signIn, signOut, useSession } from "next-auth/react";

export default function IntegrationsPage() {
    const { data: session } = useSession();
    const isGithubConfigured = true; // Secrets provided

    // Check if user has a GitHub access token in their session
    // This requires the session callback update we just made
    const isConnected = !!(session as any)?.accessToken;

    return (
        <div className="space-y-8 max-w-5xl mx-auto p-6 md:p-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold mb-2">Integrations</h1>
                <p className="text-gray-400">Connect your account with third-party services to enhance your workflow.</p>
            </div>

            {/* Alert for setup */}
            {!isGithubConfigured && (
                <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-200">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Configuration Required</AlertTitle>
                    <AlertDescription>
                        GitHub integration requires server-side configuration. Please add <code className="bg-black/30 px-1 rounded">GITHUB_CLIENT_ID</code> and <code className="bg-black/30 px-1 rounded">GITHUB_CLIENT_SECRET</code> to your .env file.
                    </AlertDescription>
                </Alert>
            )}

            {/* Integrations Grid */}
            <div className="grid gap-6">
                {/* GitHub Card */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/10 rounded-xl">
                            <Github className="h-8 w-8 text-white" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">GitHub</h3>
                                {isConnected ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/20">
                                        <CheckCircle2 className="h-3 w-3" /> Connected
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/20">
                                        Not Connected
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-400 max-w-xl">
                                Connect your GitHub account to enable automatic deployments via push (CI/CD) and repository access directly from the dashboard.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 md:mt-0 flex items-center gap-3">
                        {isConnected ? (
                            <Button variant="outline" className="border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300" onClick={() => signOut()}>
                                Disconnect
                            </Button>
                        ) : (
                            <Button
                                className="bg-[#24292e] hover:bg-[#2f363d] text-white border border-white/10"
                                disabled={!isGithubConfigured}
                                onClick={() => signIn('github')}
                            >
                                <Github className="h-4 w-4 mr-2" />
                                Connect GitHub
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-gray-500">
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Coming Soon: Discord */}
                <div className="flex flex-col md:flex-row items-center justify-between p-6 rounded-xl border border-white/5 bg-white/[0.01] opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#5865F2]/20 rounded-xl">
                            {/* Discord Icon placeholder since it might not be in lucide-react default export sometimes, using simple div */}
                            <svg className="w-8 h-8 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 3.903 3.903 0 0 0-.84 1.722 19.28 19.28 0 0 0-4.996 0 3.902 3.902 0 0 0-.84-1.722.074.074 0 0 0-.08-.037 19.791 19.791 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.018.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.018.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.074.074 0 0 0-.032-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" /></svg>
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg">Discord</h3>
                            <p className="text-gray-400">Sync roles and team members from your Discord server.</p>
                        </div>
                    </div>
                    <Button variant="ghost" disabled>Coming Soon</Button>
                </div>
            </div>
        </div>
    );
}
