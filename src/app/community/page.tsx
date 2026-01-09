'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Download, Star, Filter, TrendingUp, Clock, ArrowRight, Package, Shield, Music, Gamepad2, Coins, BarChart3, Wrench, Box } from 'lucide-react';

interface PublishedBot {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    tags: string;
    downloads: number;
    stars: number;
    avgRating: number;
    author: { id: string; name: string | null };
    _count: { reviews: number };
    createdAt: string;
}

const CATEGORIES = [
    { value: 'all', label: 'All Bots', icon: Box },
    { value: 'moderation', label: 'Moderation', icon: Shield },
    { value: 'music', label: 'Music', icon: Music },
    { value: 'utility', label: 'Utility', icon: Wrench },
    { value: 'fun', label: 'Fun & Games', icon: Gamepad2 },
    { value: 'economy', label: 'Economy', icon: Coins },
    { value: 'leveling', label: 'Leveling', icon: BarChart3 },
];

const CATEGORY_COLORS: Record<string, string> = {
    moderation: 'from-red-500 to-orange-500',
    music: 'from-purple-500 to-pink-500',
    utility: 'from-blue-500 to-cyan-500',
    fun: 'from-yellow-500 to-orange-500',
    economy: 'from-green-500 to-emerald-500',
    leveling: 'from-indigo-500 to-purple-500',
    automation: 'from-gray-500 to-slate-500',
    other: 'from-gray-500 to-slate-500',
};

export default function CommunityPage() {
    const [bots, setBots] = useState<PublishedBot[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [sort, setSort] = useState('popular');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchBots();
    }, [search, category, sort, page]);

    async function fetchBots() {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                ...(search && { search }),
                ...(category !== 'all' && { category }),
                sort,
                page: page.toString(),
                limit: '12'
            });

            const res = await fetch(`/api/community?${params}`);
            const data = await res.json();
            setBots(data.bots || []);
            setTotalPages(data.pagination?.pages || 1);
        } catch (error) {
            console.error('Error fetching bots:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#030303] text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-[#030303]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 font-semibold text-lg">
                        <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-black text-sm">
                            C
                        </div>
                        <span>Community</span>
                    </Link>
                    <Link
                        href="/dashboard"
                        className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                        Dashboard
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <section className="py-20 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Community <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Bots</span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-10">
                        Discover and deploy amazing Discord bots created by the community
                    </p>

                    {/* Search */}
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search bots..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-lg"
                        />
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="px-6 pb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => setCategory(cat.value)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${category === cat.value
                                            ? 'bg-white text-black'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <cat.icon className="h-4 w-4" />
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                                <option value="popular">Most Popular</option>
                                <option value="stars">Most Stars</option>
                                <option value="downloads">Most Downloads</option>
                                <option value="recent">Recently Added</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bots Grid */}
            <section className="px-6 pb-20">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : bots.length === 0 ? (
                        <div className="text-center py-20">
                            <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No bots found</h3>
                            <p className="text-gray-500">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bots.map((bot) => (
                                    <BotCard key={bot.id} bot={bot} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-12">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`h-10 w-10 rounded-lg font-medium transition-all ${page === i + 1
                                                    ? 'bg-white text-black'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}

function BotCard({ bot }: { bot: PublishedBot }) {
    const categoryColor = CATEGORY_COLORS[bot.category] || CATEGORY_COLORS.other;
    const tags = bot.tags ? bot.tags.split(',').slice(0, 3) : [];

    return (
        <Link href={`/community/${bot.slug}`}>
            <div className="group h-full p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${categoryColor} p-0.5 shrink-0`}>
                        <div className="h-full w-full rounded-[10px] bg-[#030303] flex items-center justify-center text-xl font-bold">
                            {bot.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{bot.stars}</span>
                    </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                    {bot.name}
                </h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">
                    {bot.description}
                </p>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {tags.map((tag, i) => (
                            <span key={i} className="px-2 py-1 rounded-md bg-white/5 text-xs text-gray-400">
                                {tag.trim()}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {bot.downloads}
                        </span>
                        <span className="capitalize">{bot.category}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                        by {bot.author.name || 'Unknown'}
                    </span>
                </div>
            </div>
        </Link>
    );
}
