'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Send, AlertTriangle, Clock, AlertCircle, HelpCircle, MessageSquare, Zap, CreditCard, Settings } from 'lucide-react';

const categories = [
    { value: 'technical', label: 'Technical Issue', icon: Settings, description: 'Bugs, errors, or technical problems' },
    { value: 'billing', label: 'Billing & Account', icon: CreditCard, description: 'Payments, subscriptions, account access' },
    { value: 'feature', label: 'Feature Request', icon: Zap, description: 'Suggest new features or improvements' },
    { value: 'other', label: 'General Inquiry', icon: HelpCircle, description: 'Other questions or feedback' },
];

const priorities = [
    { value: 'LOW', label: 'Low', description: 'No rush, general question', color: 'text-gray-400 border-gray-500/30 bg-gray-500/10' },
    { value: 'MEDIUM', label: 'Medium', description: 'Normal priority', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
    { value: 'HIGH', label: 'High', description: 'Affecting my workflow', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
    { value: 'URGENT', label: 'Urgent', description: 'Critical, needs immediate attention', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
];

export default function NewTicketPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        category: 'technical',
        priority: 'MEDIUM',
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const ticket = await res.json();
                toast.success('Ticket created successfully!');
                router.push(`/dashboard/support/${ticket.id}`);
            } else {
                throw new Error("Failed to create ticket");
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to create ticket. Please try again.');
            setLoading(false);
        }
    };

    const selectedCategory = categories.find(c => c.value === formData.category);
    const selectedPriority = priorities.find(p => p.value === formData.priority);

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            {/* Back Button */}
            <div className="mb-6">
                <Button variant="ghost" className="gap-2 pl-0 text-muted-foreground hover:text-foreground" asChild>
                    <Link href="/dashboard/support">
                        <ArrowLeft className="h-4 w-4" /> Back to Support
                    </Link>
                </Button>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    Open a Support Ticket
                </h1>
                <p className="text-muted-foreground mt-2">
                    Describe your issue in detail. Our team typically responds within 24 hours.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-8">
                    {/* Category Selection */}
                    <div className="space-y-3">
                        <Label className="text-base">What can we help you with?</Label>
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
                                            p-4 rounded-xl border text-left transition-all duration-200
                                            ${isSelected
                                                ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                                : 'border-white/10 bg-background/40 hover:border-white/20 hover:bg-background/60'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary/20 text-primary' : 'bg-white/10 text-muted-foreground'}`}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <span className={`font-medium ${isSelected ? 'text-primary' : ''}`}>{cat.label}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                        <Label htmlFor="subject" className="text-base">Subject</Label>
                        <Input
                            id="subject"
                            placeholder="Brief summary of your issue"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            required
                            className="bg-background/50 border-white/10 h-12"
                        />
                    </div>

                    {/* Priority Selection */}
                    <div className="space-y-3">
                        <Label className="text-base">Priority Level</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {priorities.map((p) => {
                                const isSelected = formData.priority === p.value;
                                return (
                                    <button
                                        key={p.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, priority: p.value })}
                                        className={`
                                            p-3 rounded-lg border text-center transition-all duration-200
                                            ${isSelected
                                                ? `${p.color} ring-2 ring-current/20`
                                                : 'border-white/10 bg-background/40 hover:border-white/20'}
                                        `}
                                    >
                                        <span className={`text-sm font-medium ${isSelected ? '' : 'text-muted-foreground'}`}>
                                            {p.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground">{selectedPriority?.description}</p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-base">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Please provide as much detail as possible about your issue..."
                            className="min-h-[180px] bg-background/50 border-white/10 resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Include any error messages, steps to reproduce, or relevant details.
                        </p>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end pt-4 border-t border-white/5">
                        <Button
                            type="submit"
                            disabled={loading || !formData.subject.trim() || !formData.description.trim()}
                            className="gap-2 h-12 px-8 shadow-lg shadow-primary/20"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Submit Ticket
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
