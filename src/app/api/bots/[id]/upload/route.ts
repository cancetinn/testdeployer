import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

import { createDeployment, updateDeployment } from "@/lib/deployments";

// ... imports ...

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;

    // Verify ownership
    const bot = await prisma.bot.findUnique({
        where: { id },
        include: { owner: true }
    });

    if (!bot || bot.owner.email !== session.user.email) {
        return new NextResponse("Not found or forbidden", { status: 404 });
    }

    // Create Deployment Record
    let deployment;
    try {
        deployment = await createDeployment(id, 'queued'); // Queued until we extract
    } catch (e) { console.error("Dep log fail", e) }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return new NextResponse("No file provided", { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Define Paths
        const botDir = path.join(process.cwd(), 'storage', 'bots', id);
        if (!fs.existsSync(botDir)) {
            fs.mkdirSync(botDir, { recursive: true });
        }

        // Save and Extract
        const zipPath = path.join(botDir, 'upload.zip');
        fs.writeFileSync(zipPath, buffer);

        const zip = new AdmZip(zipPath);
        zip.extractAllTo(botDir, true);

        // Cleanup zip file
        fs.unlinkSync(zipPath);

        if (deployment) {
            await updateDeployment(deployment.id, 'completed', 'Code uploaded successfully. Restart bot to apply.');
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Upload error:", error);

        if (deployment) {
            await updateDeployment(deployment.id, 'failed', 'Upload failed: ' + error.message);
        }

        return new NextResponse("Upload failed: " + error.message, { status: 500 });
    }
}
