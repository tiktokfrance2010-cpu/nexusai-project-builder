"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AnimatedBackground from "@/components/AnimatedBackground"
import AuthModal from "@/components/AuthModal"
import { Instagram, MessageCircle, Globe, Users, Code } from "lucide-react"

export default function Home() {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: "login" | "signup" }>({
    isOpen: false,
    mode: "login"
  })
  const [description, setDescription] = useState("")
  const router = useRouter()

  const handleAuthSuccess = () => {
    router.push("/dashboard")
  }

  const openAuth = (mode: "login" | "signup") => {
    setAuthModal({ isOpen: true, mode })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          Nexus.ai
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => openAuth("signup")}
            className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/20"
          >
            Sign Up
          </button>
          <button
            onClick={() => openAuth("login")}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-all"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-4xl mx-auto px-8 pt-20 pb-32">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Build Anything with AI
          </h1>
          <p className="text-xl text-gray-400 mb-12">
            Create stunning websites, apps, and presentations using the power of artificial intelligence
          </p>

          <div className="mb-8">
            <textarea
              placeholder="Describe the website you want to create..."
              className="w-full h-32 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none resize-none text-white placeholder:text-gray-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-6 justify-center">
            <button
              onClick={() => openAuth("login")}
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/20 font-semibold"
            >
              Get Started
            </button>
            <button
              onClick={() => openAuth("signup")}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-all font-semibold"
            >
              Start Building
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">What Nexus.ai Can Do</h2>
          <div className="grid grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all">
              <Globe className="w-12 h-12 mb-4 text-purple-500" />
              <h3 className="text-xl font-semibold mb-2">Build Websites</h3>
              <p className="text-gray-400">Create responsive, modern websites with AI assistance</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all">
              <Code className="w-12 h-12 mb-4 text-blue-500" />
              <h3 className="text-xl font-semibold mb-2">Develop Apps</h3>
              <p className="text-gray-400">Generate full-stack applications instantly</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition-all">
              <Users className="w-12 h-12 mb-4 text-pink-500" />
              <h3 className="text-xl font-semibold mb-2">Design Presentations</h3>
              <p className="text-gray-400">Craft beautiful presentations effortlessly</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 py-16 border-y border-white/10">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-500 mb-2">50+</div>
            <div className="text-gray-400">Languages Supported</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-500 mb-2">100K+</div>
            <div className="text-gray-400">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-pink-500 mb-2">500K+</div>
            <div className="text-gray-400">Projects Created</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-8 flex items-center justify-between">
          <div className="text-gray-400">© 2024 Nexus.ai. All rights reserved.</div>
          <div className="flex gap-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-purple-500 transition-colors"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-green-500 transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
            </a>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        mode={authModal.mode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}