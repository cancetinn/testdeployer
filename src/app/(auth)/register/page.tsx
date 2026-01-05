'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Bot, Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const firstName = formData.get('first-name') as string;
        const lastName = formData.get('last-name') as string;

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    name: `${firstName} ${lastName}`.trim(),
                }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg);
            }

            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/50">
                        <Bot className="h-7 w-7 text-primary" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Create an account</h1>
                <p className="text-muted-foreground text-sm">Start deploying your Discord bots in seconds</p>
            </div>

            <Card className="border-sidebar-border bg-sidebar/50 backdrop-blur-sm">
                <CardContent className="pt-6 space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first-name">First name</Label>
                                <Input id="first-name" name="first-name" placeholder="John" className="bg-background/50 border-input" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last-name">Last name</Label>
                                <Input id="last-name" name="last-name" placeholder="Doe" className="bg-background/50 border-input" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="name@example.com" className="bg-background/50 border-input" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" className="bg-background/50 border-input" required />
                        </div>

                        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                        <Button className="w-full" size="lg" type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
