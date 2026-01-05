import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal, Cpu, Zap, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white relative overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-black to-black">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-30 animate-pulse" />
      </div>

      <header className="px-6 h-16 flex items-center justify-between border-b border-white/10 backdrop-blur-md fixed w-full z-50">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-black shadow-[0_0_15px_rgba(124,58,237,0.5)]">
            C
          </div>
          <span className="tracking-tight text-white">CANTEST</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button className="bg-white text-black hover:bg-gray-200" asChild>
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-32 pb-20">
        <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-[0_0_20px_rgba(124,58,237,0.2)]">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-ping"></span>
          CANTEST v1.0 Public Beta is Live
        </div>

        <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 max-w-5xl bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-2">
          Deploy Discord Bots <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 block mt-2 drop-shadow-2xl">
            Beyond Limits.
          </span>
        </h1>

        <p className="text-lg md:text-2xl text-gray-400 max-w-3xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 leading-relaxed">
          The ultimate managed infrastructure for your Discord bots.
          <br className="hidden md:block" />
          Zero configuration, instant global limits, and 99.9% uptime.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
          <Button size="lg" className="h-14 px-10 text-lg gap-2 bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(124,58,237,0.4)] transition-all hover:scale-105" asChild>
            <Link href="/register">
              Start Building <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-10 text-lg gap-2 border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 backdrop-blur-sm transition-all" asChild>
            <Link href="/dashboard/new">
              <Terminal className="h-5 w-5" /> Live Demo
            </Link>
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-left backdrop-blur-sm">
            <div className="h-12 w-12 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Instant Deployments</h3>
            <p className="text-gray-400">Push your code and your bot goes live in seconds. No complex CI/CD pipelines needed.</p>
          </div>
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-left backdrop-blur-sm">
            <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4 text-primary">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Managed Resources</h3>
            <p className="text-gray-400">We handle the servers, scaling, and memory management so you can focus on coding.</p>
          </div>
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-left backdrop-blur-sm">
            <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4 text-green-400">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure & Isolated</h3>
            <p className="text-gray-400">Each bot runs in its own secure container environment with encrypted variable storage.</p>
          </div>
        </div>

        {/* Mock Terminal Preview */}
        <div className="mt-32 w-full max-w-5xl rounded-xl border border-white/10 bg-black/80 backdrop-blur-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="mx-auto text-xs font-mono text-muted-foreground flex items-center gap-2">
              <Terminal className="h-3 w-3" />
              user@cantest-cli ~
            </div>
          </div>
          <div className="p-8 text-left font-mono text-sm space-y-3">
            <div className="flex gap-2">
              <span className="text-green-400">➜</span>
              <span className="text-blue-400">~</span>
              <span className="text-white">$ cantest deploy ./my-awesome-bot</span>
            </div>
            <div className="text-gray-500 pl-4">INITIALIZING DEPLOYMENT...</div>
            <div className="text-gray-400 pl-4">→ Uploading files (2.4MB)</div>
            <div className="text-gray-400 pl-4">→ Building container environment</div>
            <div className="text-gray-400 pl-4">→ Installing dependencies...</div>
            <div className="text-white pl-4 font-bold">✓ Build Complete (1.2s)</div>
            <div className="text-gray-500 pl-4 mt-2">STARTING BOT INSTANCE...</div>
            <div className="pl-4 text-green-400 font-bold">✓ Bot is successfully online!</div>
            <div className="pl-4 text-purple-400">Dashboard Link: https://cantest.dev/dashboard/bot/b1238912</div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-12 text-center text-sm text-gray-500 bg-black">
        <p>© 2026 CANTEST Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
