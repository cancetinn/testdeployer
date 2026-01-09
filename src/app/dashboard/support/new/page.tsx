'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Send, Zap, CreditCard, HelpCircle, Bug, AlertTriangle, Minus, ArrowUp, ArrowUpRight } from 'lucide-react';

const categories = [
    { value: 'technical', label: 'Technical Issue', icon: Bug, description: 'Bugs, errors, or problems', color: 'from-red-500/20 to-red-500/5 border-red-500/20 hover:border-red-500/40' },
    { value: 'billing', label: 'Billing', icon: CreditCard, description: 'Payments & subscriptions', color: 'from-green-500/20 to-green-500/5 border-green-500/20 hover:border-green-500/40' },
    { value: 'feature', label: 'Feature Request', icon: Zap, description: 'Suggest improvements', color: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40' },
    { value: 'other', label: 'General', icon: HelpCircle, description: 'Other questions', color: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40' },
];

const priorities = [
    { value: 'LOW', label: 'Low', icon: Minus, color: 'text-gray-400' },
    { value: 'MEDIUM', label: 'Medium', icon: ArrowUp, color: 'text-yellow-400' },
    { value: 'HIGH', label: 'High', icon: ArrowUp, color: 'text-orange-400' },
    { value: 'URGENT', label: 'Urgent', icon: AlertTriangle, color: 'text-red-400' },
];

export default function NewTicketPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        category: '',
        priority: 'MEDIUM',
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.category) {
            toast.error('Please select a category');
            return;
        }
        setLoading(true);

        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const ticket = await res.json();
                toast.success('Ticket created!');
                router.push(`/dashboard/support/${ticket.id}`);
            } else {
                throw new Error("Failed to create ticket");
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to create ticket');
            setLoading(false);
        }
    };

    const selectedCategory = categories.find(c => c.value === formData.category);

    return (
        <div className="max-w-3xl mx-auto py-8 px-6">
            {/* Back */}
            <Link
                href="/dashboard/support"
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Support
            </Link>

            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Create a Ticket</h1>
                <p className="text-gray-400">
                    Describe your issue and we'll get back to you within 24 hours.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Category */}
                <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-300">
                        What can we help you with?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            const isSelected = formData.category === cat.value;
                            return (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: cat.value })}
                                    className={`
                                        p-4 rounded-2xl border text-left transition-all
                                        ${isSelected
                                            ? `bg-gradient-to-br ${cat.color} ring-2 ring-white/20`
                                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'}
                                    `}
                                >
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${isSelected ? 'bg-white/10' : 'bg-white/5'
                                        }`}>
                                        <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                                    </div>
                                    <p className={`font-medium mb-0.5 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                        {cat.label}
                                    </p>
                                    <p className="text-xs text-gray-500">{cat.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-gray-300">
                        Subject
                    </label>
                    <input
                        id="subject"
                        type="text"
                        placeholder="Brief summary of your issue"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 transition-all"
                    />
                </div>

                {/* Priority */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Priority</label>
                    <div className="flex gap-2">
                        {priorities.map((p) => {
                            const Icon = p.icon;
                            const isSelected = formData.priority === p.value;
                            return (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority: p.value })}
                                    className={`
                                        flex-1 h-11 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-all
                                        ${isSelected
                                            ? 'bg-white/10 border-white/20'
                                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'}
                                    `}
                                >
                                    <Icon className={`h-4 w-4 ${p.color}`} />
                                    <span className={isSelected ? 'text-white' : 'text-gray-400'}>
                                        {p.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium text-gray-300">
                        Description
                    </label>
                    <textarea
                        id="description"
                        placeholder="Provide as much detail as possible..."
                        rows={6}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 transition-all"
                    />
                    <p className="text-xs text-gray-500">
                        Include error messages, steps to reproduce, or any relevant details.
                    </p>
                </div>

                {/* Submit */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading || !formData.subject.trim() || !formData.description.trim() || !formData.category}
                        className="group w-full h-14 rounded-xl bg-white text-black font-semibold text-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg shadow-white/10"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                Submit Ticket
                                <ArrowUpRight className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
