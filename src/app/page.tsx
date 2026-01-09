import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white selection:bg-white/20">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b border-white/[0.08] bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 font-semibold text-lg tracking-tight">
              <div className="h-7 w-7 bg-gradient-to-br from-white to-gray-400 rounded-md flex items-center justify-center text-black font-black text-sm shadow-lg shadow-white/10">
                C
              </div>
              <span>CANTEST</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {['Features', 'Pricing', 'Docs'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-[13px] text-gray-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition-all"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-[13px] text-gray-400 hover:text-white px-4 py-1.5 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="text-[13px] bg-white text-black px-4 py-1.5 rounded-full font-medium hover:bg-gray-100 transition-all shadow-lg shadow-white/10">
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-r from-purple-500/20 via-blue-500/10 to-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
            <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px]" />
          </div>

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />

          {/* Floating elements */}
          <div className="absolute top-32 left-[15%] w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute top-48 right-[20%] w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
          <div className="absolute bottom-32 left-[25%] w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }} />

          <div className="max-w-4xl mx-auto text-center relative z-10 pt-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-300">Now in Public Beta</span>
              <ArrowRight className="h-3 w-3 text-gray-500" />
            </div>

            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[0.9]">
              <span className="block">Deploy Bots.</span>
              <span className="block bg-gradient-to-r from-gray-400 via-gray-300 to-gray-500 bg-clip-text text-transparent">
                Not Complexity.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              The modern platform for Discord bot deployment.
              Zero configuration, instant scaling, enterprise security.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/register"
                className="group flex items-center gap-2 bg-white text-black px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-2xl shadow-white/20 hover:shadow-white/30 hover:scale-105"
              >
                Start Building
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-4 rounded-xl font-semibold hover:bg-white/10 hover:border-white/20 transition-all"
              >
                Live Demo
              </Link>
            </div>

            {/* Terminal Preview */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                  </div>
                  <span className="text-xs text-gray-500 ml-2 font-mono">terminal</span>
                </div>
                <div className="p-6 font-mono text-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-green-400">→</span>
                    <span className="text-gray-500">$</span>
                    <span className="text-white">cantest deploy ./my-bot</span>
                  </div>
                  <div className="text-gray-600 pl-6">Uploading files...</div>
                  <div className="text-gray-500 pl-6">Installing dependencies...</div>
                  <div className="text-gray-400 pl-6">Building container...</div>
                  <div className="flex items-center gap-2 pl-6">
                    <span className="text-green-400">✓</span>
                    <span className="text-white">Bot deployed successfully!</span>
                  </div>
                  <div className="text-purple-400 pl-6">https://cantest.dev/bot/a3x8k2</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
            <div className="w-5 h-8 border-2 border-gray-600 rounded-full flex justify-center pt-1">
              <div className="w-1 h-2 bg-gray-500 rounded-full animate-bounce" />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-6 border-t border-white/[0.05]">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
              {[
                { value: '99.9%', label: 'Uptime SLA' },
                { value: '<50ms', label: 'Deploy Time' },
                { value: '10K+', label: 'Bots Deployed' },
                { value: '24/7', label: 'Support' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Everything you need
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                From deployment to monitoring, we've got you covered.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Large Feature Card */}
              <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent border border-white/10 p-8 hover:border-purple-500/30 transition-all">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] group-hover:bg-purple-500/30 transition-all" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Instant Deployments</h3>
                  <p className="text-gray-400 leading-relaxed max-w-md">
                    Push your code and watch it go live in seconds. No build configs, no CI/CD setup, no waiting.
                  </p>
                </div>
              </div>

              {/* Small Feature Card */}
              <div className="group relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/10 p-8 hover:border-white/20 transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Enterprise Security</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Encrypted secrets, isolated containers, and SOC 2 compliance.
                </p>
              </div>

              {/* Small Feature Card */}
              <div className="group relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/10 p-8 hover:border-white/20 transition-all">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Real-time Metrics</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Monitor CPU, memory, and logs in real-time from your dashboard.
                </p>
              </div>

              {/* Large Feature Card */}
              <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-white/10 p-8 hover:border-cyan-500/30 transition-all">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px] group-hover:bg-cyan-500/30 transition-all" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Live Console</h3>
                  <p className="text-gray-400 leading-relaxed max-w-md">
                    Stream logs directly from your bot. Debug issues instantly with real-time output and error tracking.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Features List */}
            <div className="grid md:grid-cols-3 gap-x-8 gap-y-6 mt-16 pt-16 border-t border-white/5">
              {[
                { icon: '⚡', title: 'Auto-scaling', desc: 'Scales automatically based on demand' },
                { icon: '🔄', title: 'Auto-restart', desc: 'Automatic recovery from crashes' },
                { icon: '🌍', title: 'Global CDN', desc: 'Deploy close to Discord servers' },
                { icon: '📦', title: 'npm Support', desc: 'Automatic dependency installation' },
                { icon: '🔐', title: 'Env Variables', desc: 'Encrypted secret management' },
                { icon: '📊', title: 'Analytics', desc: 'Detailed usage insights' },
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <h4 className="font-semibold mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto text-center relative">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-blue-500/20 blur-[100px] -z-10" />

            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to ship?
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">
              Deploy your first bot in under 2 minutes. No credit card required.
            </p>
            <Link
              href="/register"
              className="group inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-2xl shadow-white/20 hover:shadow-white/30 hover:scale-105"
            >
              Get Started for Free
              <ArrowUpRight className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2.5 font-semibold text-lg mb-4">
                <div className="h-7 w-7 bg-gradient-to-br from-white to-gray-400 rounded-md flex items-center justify-center text-black font-black text-sm">
                  C
                </div>
                <span>CANTEST</span>
              </Link>
              <p className="text-sm text-gray-500">
                The modern Discord bot deployment platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Support</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/dashboard/support" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">© 2026 CANTEST Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
