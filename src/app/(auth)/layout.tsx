export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] -z-10" />

            <main className="w-full max-w-md p-4 relative z-10">
                {children}
            </main>
        </div>
    );
}
