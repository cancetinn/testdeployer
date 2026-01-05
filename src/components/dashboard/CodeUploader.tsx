'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Archive, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CodeUploader({ botId }: { botId: string }) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setSuccess(false);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const res = await fetch(`/api/bots/${botId}/upload`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                setSuccess(true);
                setSelectedFile(null);
                router.refresh(); // Refresh to show new deployment in list if applicable
                setTimeout(() => setSuccess(false), 3000);
            } else {
                alert("Upload failed");
            }
        } catch (error) {
            console.error(error);
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Update Source Code</CardTitle>
                <CardDescription>Upload a new .zip file to replace the current bot code.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 text-center hover:border-primary/50 hover:bg-muted/50 transition-colors">
                    <input
                        type="file"
                        id="update-upload"
                        className="hidden"
                        accept=".zip"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                setSelectedFile(e.target.files[0]);
                                setSuccess(false);
                            }
                        }}
                    />
                    <label htmlFor="update-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        <Archive className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">
                            {selectedFile ? selectedFile.name : "Click to select .zip file"}
                        </p>
                    </label>
                </div>

                <div className="flex items-center justify-end gap-2">
                    {success && <span className="text-green-500 flex items-center gap-1 text-sm"><CheckCircle2 className="h-4 w-4" /> Uploaded</span>}
                    <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload & Deploy"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
