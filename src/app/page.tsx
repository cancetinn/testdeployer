import Link from "next/link";
import { ArrowRight, ArrowUpRight, Zap, RefreshCw, Globe, Package, Lock, BarChart3, Server, Shield, Terminal, Clock, Rocket, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#030303] text-white selection:bg-purple-500/30 overflow-x-hidden">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b border-white/[0.06] bg-[#030303]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 font-semibold text-lg tracking-tight group">
              <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow">
                C
              </div>
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">CANTEST</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {['Features', 'Pricing', 'Docs'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-[13px] text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-[13px] text-gray-400 hover:text-white px-4 py-2 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="text-[13px] bg-gradient-to-r from-purple-500 to-blue-500 text-white px-5 py-2 rounded-full font-medium hover:opacity-90 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
          {/* Animated orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-r from-purple-600/30 via-blue-600/20 to-cyan-600/30 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute top-20 left-20 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[80px] float" style={{ animationDelay: '0s' }} />
            <div className="absolute bottom-20 right-20 w-[250px] h-[250px] bg-blue-500/20 rounded-full blur-[80px] float" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-10 w-[200px] h-[200px] bg-cyan-500/15 rounded-full blur-[60px] float" style={{ animationDelay: '4s' }} />
          </div>

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px'
            }}
          />

          {/* Floating particles */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/60 rounded-full animate-bounce"
              style={{
                top: `${20 + i * 15}%`,
                left: `${10 + i * 20}%`,
                animationDuration: `${3 + i}s`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}

          <div className="max-w-5xl mx-auto text-center relative z-10 pt-20">

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.05] animate-in-delay-1">
              <span className="block text-white">Deploy Discord Bots</span>
              <span className="block bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                In Seconds
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-in-delay-2">
              The most powerful platform for Discord bot deployment.
              <span className="text-white"> Zero config. Instant scaling. Enterprise security.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-in-delay-3">
              <Link
                href="/register"
                className="group flex items-center gap-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:opacity-90 transition-all shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
              >
                Start Building Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live Demo
              </Link>
            </div>

            {/* Terminal Preview */}
            <div className="max-w-2xl mx-auto animate-in-delay-4">
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative bg-[#0d0d0d] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs text-gray-500 ml-2 font-mono">terminal — zsh</span>
                  </div>
                  <div className="p-6 font-mono text-sm space-y-2 text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-purple-400">❯</span>
                      <span className="text-white">cantest deploy ./my-discord-bot</span>
                      <span className="animate-pulse">▌</span>
                    </div>
                    <div className="text-gray-600 pl-5">📦 Uploading files...</div>
                    <div className="text-gray-500 pl-5">📥 Installing dependencies...</div>
                    <div className="text-gray-400 pl-5">🐳 Building container...</div>
                    <div className="flex items-center gap-2 pl-5 text-green-400">
                      <span>✓</span>
                      <span>Deployed in 847ms!</span>
                    </div>
                    <div className="pl-5">
                      <span className="text-gray-500">→</span>
                      <span className="text-cyan-400 ml-2">https://cantest.dev/bot/my-discord-bot</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-gradient-to-b from-purple-400 to-transparent rounded-full animate-bounce" />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 px-6 border-t border-white/[0.05] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent" />
          <div className="max-w-6xl mx-auto relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 stagger-children">
              {[
                { value: '99.9%', label: 'Uptime SLA', icon: Server, color: 'from-green-400 to-emerald-500' },
                { value: '<50ms', label: 'Deploy Time', icon: Zap, color: 'from-yellow-400 to-orange-500' },
                { value: '50K+', label: 'Bots Deployed', icon: Rocket, color: 'from-purple-400 to-pink-500' },
                { value: '24/7', label: 'Expert Support', icon: Users, color: 'from-blue-400 to-cyan-500' },
              ].map((stat, i) => (
                <div key={i} className="group p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300">
                  <div className="mb-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} p-0.5`}>
                      <div className="h-full w-full rounded-[10px] bg-[#030303] flex items-center justify-center">
                        <stat.icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-6">
                <Zap className="h-4 w-4" />
                Powerful Features
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Everything you need to
                <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">ship faster</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                From deployment to monitoring, we handle the infrastructure so you can focus on building.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Large Feature Card */}
              <div className="md:col-span-2 group relative overflow-hidden rounded-3xl border border-white/10 p-8 hover:border-purple-500/30 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/5" />
                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 p-0.5 mb-6">
                    <div className="h-full w-full rounded-[14px] bg-[#030303] flex items-center justify-center">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Lightning Fast Deployments</h3>
                  <p className="text-gray-400 leading-relaxed max-w-lg">
                    Push your code and watch it go live in under a second. No CI/CD configuration, no waiting. Just instant, reliable deployments every time.
                  </p>
                </div>
              </div>

              {/* Small Feature Card */}
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 p-8 hover:border-blue-500/30 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-0.5 mb-6">
                    <div className="h-full w-full rounded-[10px] bg-[#030303] flex items-center justify-center">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Enterprise Security</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Encrypted secrets, isolated containers, and SOC 2 compliance built-in.
                  </p>
                </div>
              </div>

              {/* Small Feature Card */}
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 p-8 hover:border-green-500/30 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-0.5 mb-6">
                    <div className="h-full w-full rounded-[10px] bg-[#030303] flex items-center justify-center">
                      <BarChart3 className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Real-time Analytics</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Monitor CPU, memory, and logs with live dashboards.
                  </p>
                </div>
              </div>

              {/* Large Feature Card */}
              <div className="md:col-span-2 group relative overflow-hidden rounded-3xl border border-white/10 p-8 hover:border-cyan-500/30 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 p-0.5 mb-6">
                    <div className="h-full w-full rounded-[14px] bg-[#030303] flex items-center justify-center">
                      <Terminal className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Live Console & Logs</h3>
                  <p className="text-gray-400 leading-relaxed max-w-lg">
                    Stream logs directly from your bot in real-time. Debug issues instantly with powerful search and error tracking.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Features Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 stagger-children">
              {[
                { icon: Zap, title: 'Auto-scaling', desc: 'Scales automatically based on demand', color: 'from-yellow-400 to-orange-500' },
                { icon: RefreshCw, title: 'Auto-restart', desc: 'Automatic recovery from crashes', color: 'from-blue-400 to-cyan-500' },
                { icon: Globe, title: 'Global CDN', desc: 'Deploy close to Discord servers', color: 'from-green-400 to-emerald-500' },
                { icon: Package, title: 'npm Support', desc: 'Automatic dependency installation', color: 'from-orange-400 to-red-500' },
                { icon: Lock, title: 'Env Variables', desc: 'Encrypted secret management', color: 'from-red-400 to-pink-500' },
                { icon: BarChart3, title: 'Analytics', desc: 'Detailed usage insights', color: 'from-purple-400 to-pink-500' },
              ].map((feature, i) => (
                <div key={i} className="group p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 flex items-start gap-4">
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 shrink-0`}>
                    <div className="h-full w-full rounded-[10px] bg-[#030303] flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 group-hover:text-white transition-colors">{feature.title}</h4>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-purple-500/20 via-blue-500/10 to-cyan-500/20 rounded-full blur-[100px]" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Limited Time: Free Tier Available
            </div>

            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to deploy?
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">
              Join 10,000+ developers. Deploy your first bot in under 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-10 py-5 rounded-2xl font-semibold text-lg hover:opacity-90 transition-all shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
              >
                Get Started Free
                <ArrowUpRight className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <span className="text-gray-500 text-sm">No credit card required</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-16 px-6 bg-[#030303]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2.5 font-semibold text-lg mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-black text-sm">
                  C
                </div>
                <span>CANTEST</span>
              </Link>
              <p className="text-sm text-gray-500 mb-4">
                The modern Discord bot deployment platform.
              </p>
              <div className="flex gap-3">
                <a href="#" className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                </a>
                <a href="#" className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href="#" className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" /></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Support</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link href="/dashboard/support" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">© 2026 CANTEST Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
