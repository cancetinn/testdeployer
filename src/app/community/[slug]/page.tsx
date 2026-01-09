'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Download, Calendar, Tag, User, ExternalLink, Rocket, Copy, Check, MessageSquare, ChevronDown } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface PublishedBot {
    id: string;
    name: string;
    slug: string;
    description: string;
    readme: string | null;
    category: string;
    tags: string;
    version: string;
    downloads: number;
    stars: number;
    avgRating: number;
    author: { id: string; name: string | null };
    reviews: Review[];
    _count: { reviews: number; starredBy: number };
    createdAt: string;
    userStarred: boolean;
}

interface Review {
    id: string;
    content: string;
    rating: number;
    author: { id: string; name: string | null };
    createdAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
    moderation: 'from-red-500 to-orange-500',
    music: 'from-purple-500 to-pink-500',
    utility: 'from-blue-500 to-cyan-500',
    fun: 'from-yellow-500 to-orange-500',
    economy: 'from-green-500 to-emerald-500',
    leveling: 'from-indigo-500 to-purple-500',
    other: 'from-gray-500 to-slate-500',
};

export default function BotDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [bot, setBot] = useState<PublishedBot | null>(null);
    const [loading, setLoading] = useState(true);
    const [starring, setStarring] = useState(false);
    const [deploying, setDeploying] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        fetchBot();
    }, [params.slug]);

    async function fetchBot() {
        try {
            const res = await fetch(`/api/community/${params.slug}`);
            if (!res.ok) {
                router.push('/community');
                return;
            }
            const data = await res.json();
            setBot(data);
        } catch (error) {
            console.error('Error fetching bot:', error);
        } finally {
            setLoading(false);
        }
    }

    async function toggleStar() {
        if (!session) {
            toast.error('Please login to star bots');
            return;
        }
        setStarring(true);
        try {
            const res = await fetch(`/api/community/${params.slug}`, { method: 'POST' });
            const data = await res.json();
            setBot(prev => prev ? {
                ...prev,
                stars: prev.stars + (data.starred ? 1 : -1),
                userStarred: data.starred
            } : null);
            toast.success(data.starred ? 'Bot starred!' : 'Star removed');
        } catch (error) {
            toast.error('Failed to toggle star');
        } finally {
            setStarring(false);
        }
    }

    async function deployBot() {
        if (!session) {
            toast.error('Please login to deploy bots');
            return;
        }
        setDeploying(true);
        try {
            const res = await fetch('/api/community/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: params.slug })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Bot deployed to your account!');
                router.push(`/dashboard/bot/${data.bot.id}`);
            } else {
                toast.error(data.error || 'Deploy failed');
            }
        } catch (error) {
            toast.error('Deploy failed');
        } finally {
            setDeploying(false);
        }
    }

    async function handleDownload() {
        window.location.href = `/api/community/${params.slug}/download`;
        toast.success('Download started!');
    }

    async function submitReview() {
        if (!reviewContent.trim()) return;
        setSubmittingReview(true);
        try {
            const res = await fetch(`/api/community/${params.slug}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: reviewContent, rating: reviewRating })
            });
            if (res.ok) {
                toast.success('Review submitted!');
                setShowReviewForm(false);
                setReviewContent('');
                fetchBot();
            } else {
                const err = await res.text();
                toast.error(err);
            }
        } catch (error) {
            toast.error('Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030303] flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!bot) return null;

    const categoryColor = CATEGORY_COLORS[bot.category] || CATEGORY_COLORS.other;
    const tags = bot.tags ? bot.tags.split(',') : [];

    return (
        <div className="min-h-screen bg-[#030303] text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-[#030303]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <Link href="/community" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Community
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                {/* Bot Header */}
                <div className="flex flex-col md:flex-row gap-8 mb-12">
                    {/* Icon */}
                    <div className={`h-28 w-28 rounded-2xl bg-gradient-to-br ${categoryColor} p-0.5 shrink-0`}>
                        <div className="h-full w-full rounded-[14px] bg-[#030303] flex items-center justify-center text-4xl font-bold">
                            {bot.name.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{bot.name}</h1>
                                <p className="text-gray-400">{bot.description}</p>
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
                            <span className="flex items-center gap-1.5">
                                <User className="h-4 w-4" />
                                {bot.author.name || 'Unknown'}
                            </span>
                            <span className="flex items-center gap-1.5 capitalize">
                                <Tag className="h-4 w-4" />
                                {bot.category}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {formatDistanceToNow(new Date(bot.createdAt), { addSuffix: true })}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white/10 text-xs">
                                v{bot.version}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={deployBot}
                                disabled={deploying}
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                <Rocket className="h-5 w-5" />
                                {deploying ? 'Deploying...' : 'Deploy to My Account'}
                            </button>
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all"
                            >
                                <Download className="h-5 w-5" />
                                Download Source
                            </button>
                            <button
                                onClick={toggleStar}
                                disabled={starring}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${bot.userStarred
                                    ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                    : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                <Star className={`h-5 w-5 ${bot.userStarred ? 'fill-current' : ''}`} />
                                {bot.stars}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-2xl font-bold text-yellow-400">{bot.stars}</div>
                        <div className="text-sm text-gray-500">Stars</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-2xl font-bold text-blue-400">{bot.downloads}</div>
                        <div className="text-sm text-gray-500">Downloads</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-2xl font-bold text-purple-400">{bot.avgRating.toFixed(1)}</div>
                        <div className="text-sm text-gray-500">Avg Rating</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-2xl font-bold text-green-400">{bot._count.reviews}</div>
                        <div className="text-sm text-gray-500">Reviews</div>
                    </div>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 text-sm">
                                    {tag.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* README */}
                {bot.readme && (
                    <div className="mb-12">
                        <h3 className="text-xl font-semibold mb-4">README</h3>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 prose prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap text-sm text-gray-300">{bot.readme}</pre>
                        </div>
                    </div>
                )}

                {/* Reviews */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold">Reviews</h3>
                        {session && bot.author.id !== (session.user as any)?.id && (
                            <button
                                onClick={() => setShowReviewForm(!showReviewForm)}
                                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
                            >
                                <MessageSquare className="h-4 w-4" />
                                Write a Review
                            </button>
                        )}
                    </div>

                    {/* Review Form */}
                    {showReviewForm && (
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm text-gray-400">Rating:</span>
                                {[1, 2, 3, 4, 5].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setReviewRating(r)}
                                        className="p-1"
                                    >
                                        <Star className={`h-5 w-5 ${r <= reviewRating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={reviewContent}
                                onChange={(e) => setReviewContent(e.target.value)}
                                placeholder="Write your review..."
                                className="w-full h-24 p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => setShowReviewForm(false)}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitReview}
                                    disabled={submittingReview || !reviewContent.trim()}
                                    className="px-4 py-2 bg-purple-500 rounded-lg text-sm font-medium hover:bg-purple-600 disabled:opacity-50"
                                >
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Review List */}
                    {bot.reviews.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No reviews yet. Be the first to review!</p>
                    ) : (
                        <div className="space-y-4">
                            {bot.reviews.map((review) => (
                                <div key={review.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                                                {(review.author.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium">{review.author.name || 'User'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-300 text-sm">{review.content}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
