'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Upload, AlertTriangle, FileText, Loader2, Check, Shield,
    X, Sparkles, Package, Tag, BookOpen, Rocket, ChevronRight
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

const CATEGORIES = [
    { value: 'moderation', label: 'Moderation', emoji: '🛡️', desc: 'Automod, security, anti-spam', gradient: 'from-red-500 to-orange-500' },
    { value: 'music', label: 'Music', emoji: '🎵', desc: 'Music playback, playlists', gradient: 'from-pink-500 to-purple-500' },
    { value: 'utility', label: 'Utility', emoji: '🔧', desc: 'Tools and productivity', gradient: 'from-blue-500 to-cyan-500' },
    { value: 'fun', label: 'Fun & Games', emoji: '🎮', desc: 'Entertainment and games', gradient: 'from-green-500 to-emerald-500' },
    { value: 'economy', label: 'Economy', emoji: '💰', desc: 'Currency and trading', gradient: 'from-yellow-500 to-amber-500' },
    { value: 'leveling', label: 'Leveling', emoji: '📊', desc: 'XP and ranking systems', gradient: 'from-indigo-500 to-purple-500' },
    { value: 'automation', label: 'Automation', emoji: '⚙️', desc: 'Task automation', gradient: 'from-slate-500 to-gray-500' },
    { value: 'other', label: 'Other', emoji: '📦', desc: 'Other features', gradient: 'from-teal-500 to-cyan-500' },
];

interface Bot {
    id: string;
    name: string;
}

interface ValidationResult {
    bot: Bot;
    validation: {
        valid: boolean;
        secrets: string[];
        files: string[];
    };
}

export default function PublishBotPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const botId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [step, setStep] = useState(1);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [readme, setReadme] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [version, setVersion] = useState('1.0.0');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        validateBot();
    }, [botId]);

    async function validateBot() {
        try {
            const res = await fetch(`/api/community/publish?botId=${botId}`);
            if (!res.ok) {
                toast.error('Bot not found or not owned by you');
                router.push('/dashboard');
                return;
            }
            const data = await res.json();
            setValidation(data);
            setName(data.bot.name);
        } catch (error) {
            toast.error('Failed to validate bot');
        } finally {
            setLoading(false);
        }
    }

    function addTag() {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !tags.includes(tag) && tags.length < 5) {
            setTags([...tags, tag]);
            setTagInput('');
        }
    }

    function removeTag(tag: string) {
        setTags(tags.filter(t => t !== tag));
    }

    async function handlePublish() {
        if (!name || !description || !category) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (validation && !validation.validation.valid) {
            toast.error('Cannot publish: Secrets detected in code');
            return;
        }

        setPublishing(true);
        try {
            const res = await fetch('/api/community/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    botId,
                    name,
                    description,
                    readme,
                    category,
                    tags,
                    version
                })
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || 'Failed to publish');
                return;
            }

            toast.success('Bot published to community!');
            router.push(`/community/${data.slug}`);
        } catch (error) {
            toast.error('Failed to publish bot');
        } finally {
            setPublishing(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="relative mx-auto w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
                        <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                        <Shield className="absolute inset-0 m-auto h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-white font-medium">Scanning bot files...</p>
                        <p className="text-gray-500 text-sm">Checking for secrets and sensitive data</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!validation) return null;

    const canProceed = validation.validation.valid;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Back Button */}
            <Link
                href={`/dashboard/bot/${botId}`}
                className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm group mb-8"
            >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Bot Dashboard
            </Link>

            {/* Header */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 mb-4">
                    <Rocket className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Publish to Community</h1>
                <p className="text-gray-400">Share your bot with thousands of developers</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-10">
                {[
                    { num: 1, label: 'Verification' },
                    { num: 2, label: 'Details' },
                    { num: 3, label: 'Review' }
                ].map((s, i) => (
                    <div key={s.num} className="flex items-center">
                        <button
                            onClick={() => canProceed && setStep(s.num)}
                            disabled={!canProceed && s.num > 1}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${step === s.num
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    : step > s.num
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-white/5 text-gray-500 border border-white/10'
                                } ${!canProceed && s.num > 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/10'}`}
                        >
                            {step > s.num ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">{s.num}</span>
                            )}
                            <span className="hidden sm:inline text-sm font-medium">{s.label}</span>
                        </button>
                        {i < 2 && <ChevronRight className="h-4 w-4 text-gray-600 mx-1" />}
                    </div>
                ))}
            </div>

            {/* Step 1: Verification */}
            {step === 1 && (
                <div className="space-y-6">
                    {/* Validation Card */}
                    <div className={`relative overflow-hidden rounded-2xl border p-6 ${canProceed
                            ? 'bg-green-500/5 border-green-500/20'
                            : 'bg-red-500/5 border-red-500/20'
                        }`}>
                        <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] ${canProceed ? 'bg-green-500/20' : 'bg-red-500/20'
                            }`} />

                        <div className="relative flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${canProceed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                {canProceed ? (
                                    <Check className="h-6 w-6 text-green-400" />
                                ) : (
                                    <AlertTriangle className="h-6 w-6 text-red-400" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-lg font-semibold ${canProceed ? 'text-green-400' : 'text-red-400'}`}>
                                    {canProceed ? 'Security Check Passed' : 'Security Issues Found'}
                                </h3>
                                <p className="text-gray-400 text-sm mt-1">
                                    {canProceed
                                        ? `${validation.validation.files.length} files are ready to be published`
                                        : 'Secrets or sensitive data detected in your code'
                                    }
                                </p>

                                {!canProceed && validation.validation.secrets.length > 0 && (
                                    <div className="mt-4 p-4 rounded-xl bg-black/30 border border-red-500/10">
                                        <p className="text-xs text-gray-500 mb-2 font-medium">Detected issues:</p>
                                        <ul className="space-y-1">
                                            {validation.validation.secrets.slice(0, 5).map((s, i) => (
                                                <li key={i} className="text-sm text-red-300 font-mono flex items-start gap-2">
                                                    <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                                    {s}
                                                </li>
                                            ))}
                                            {validation.validation.secrets.length > 5 && (
                                                <li className="text-gray-500 text-sm">...and {validation.validation.secrets.length - 5} more</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Files Preview */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <Package className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Files to Publish</h3>
                                <p className="text-sm text-gray-500">{validation.validation.files.length} files</p>
                            </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto rounded-xl bg-black/30 p-4">
                            <ul className="space-y-1.5">
                                {validation.validation.files.slice(0, 20).map((file, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-400 font-mono">
                                        <FileText className="h-3.5 w-3.5 text-gray-600" />
                                        {file}
                                    </li>
                                ))}
                                {validation.validation.files.length > 20 && (
                                    <li className="text-gray-600 text-sm pt-2">...and {validation.validation.files.length - 20} more files</li>
                                )}
                            </ul>
                        </div>
                    </div>

                    <button
                        onClick={() => canProceed && setStep(2)}
                        disabled={!canProceed}
                        className="w-full h-14 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90"
                    >
                        Continue <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
                <div className="space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                            <Sparkles className="h-4 w-4 text-purple-400" />
                            Bot Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Awesome Bot"
                            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                            <BookOpen className="h-4 w-4 text-blue-400" />
                            Short Description <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="A bot that does amazing things..."
                            maxLength={200}
                            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                        />
                        <p className="text-xs text-gray-600 text-right">{description.length}/200</p>
                    </div>

                    {/* Category */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                            <Package className="h-4 w-4 text-green-400" />
                            Category <span className="text-red-400">*</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setCategory(cat.value)}
                                    className={`group relative p-4 rounded-xl text-left transition-all overflow-hidden ${category === cat.value
                                            ? 'border-2 border-purple-500/50 bg-purple-500/10'
                                            : 'border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                                        }`}
                                >
                                    {category === cat.value && (
                                        <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-10`} />
                                    )}
                                    <div className="relative">
                                        <div className="text-2xl mb-2">{cat.emoji}</div>
                                        <div className="text-sm font-medium text-white">{cat.label}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{cat.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                            <Tag className="h-4 w-4 text-amber-400" />
                            Tags <span className="text-gray-600">(up to 5)</span>
                        </label>
                        <div className="flex flex-wrap gap-2 min-h-[32px]">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300"
                                >
                                    #{tag}
                                    <button
                                        onClick={() => removeTag(tag)}
                                        className="hover:text-red-400 transition-colors"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                placeholder="Add a tag..."
                                className="flex-1 h-10 px-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                disabled={tags.length >= 5}
                                className="px-4 bg-white/10 rounded-lg text-sm font-medium hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Version */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Version</label>
                        <input
                            type="text"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            placeholder="1.0.0"
                            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setStep(1)}
                            className="flex-1 h-12 rounded-xl font-medium border border-white/10 hover:bg-white/5 transition-all"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => name && description && category && setStep(3)}
                            disabled={!name || !description || !category}
                            className="flex-[2] h-12 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Continue <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Review & Publish */}
            {step === 3 && (
                <div className="space-y-6">
                    {/* README */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                            <BookOpen className="h-4 w-4 text-blue-400" />
                            README <span className="text-gray-600">(Markdown supported)</span>
                        </label>
                        <textarea
                            value={readme}
                            onChange={(e) => setReadme(e.target.value)}
                            placeholder="# My Bot&#10;&#10;Describe your bot, features, setup instructions..."
                            rows={12}
                            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none font-mono text-sm"
                        />
                    </div>

                    {/* Summary Card */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                        <h3 className="font-semibold mb-4">Publication Summary</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Name</p>
                                <p className="text-white font-medium">{name}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Category</p>
                                <p className="text-white font-medium">
                                    {CATEGORIES.find(c => c.value === category)?.emoji} {CATEGORIES.find(c => c.value === category)?.label}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Version</p>
                                <p className="text-white font-mono">{version}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Files</p>
                                <p className="text-white">{validation.validation.files.length} files</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-gray-500">Description</p>
                                <p className="text-white">{description}</p>
                            </div>
                            {tags.length > 0 && (
                                <div className="col-span-2">
                                    <p className="text-gray-500 mb-2">Tags</p>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300">#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setStep(2)}
                            className="flex-1 h-14 rounded-xl font-medium border border-white/10 hover:bg-white/5 transition-all"
                        >
                            Back
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={publishing}
                            className="flex-[2] h-14 rounded-xl font-semibold flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 transition-all text-lg"
                        >
                            {publishing ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <Upload className="h-5 w-5" /> Publish Bot
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
