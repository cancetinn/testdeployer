import Link from 'next/link';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex bg-[#0a0a0a] text-white">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/30 via-blue-500/20 to-cyan-500/30 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[80px]" />
                </div>

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    <Link href="/" className="flex items-center gap-2.5 font-semibold text-lg">
                        <div className="h-8 w-8 bg-gradient-to-br from-white to-gray-400 rounded-lg flex items-center justify-center text-black font-black text-sm shadow-lg shadow-white/10">
                            C
                        </div>
                        <span>CANTEST</span>
                    </Link>

                    <div className="max-w-md">
                        <h1 className="text-4xl font-bold mb-4 leading-tight">
                            Deploy Discord bots
                            <br />
                            <span className="text-gray-400">in seconds.</span>
                        </h1>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Zero configuration. Instant scaling. Enterprise security.
                            Join thousands of developers building on CANTEST.
                        </p>
                    </div>

                    <div className="flex items-center gap-8 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full" />
                            <span>All systems operational</span>
                        </div>
                        <span>99.9% uptime</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
                {/* Mobile gradient */}
                <div className="absolute inset-0 lg:hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-purple-500/20 rounded-full blur-[80px]" />
                </div>

                <div className="w-full max-w-md relative z-10">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <Link href="/" className="flex items-center gap-2.5 font-semibold text-lg">
                            <div className="h-8 w-8 bg-gradient-to-br from-white to-gray-400 rounded-lg flex items-center justify-center text-black font-black text-sm">
                                C
                            </div>
                            <span>CANTEST</span>
                        </Link>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
