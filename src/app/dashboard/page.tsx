"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Upload, Sparkles } from "lucide-react"

export default function Dashboard() {
  const [description, setDescription] = useState("")
  const [projectType, setProjectType] = useState<"website" | "app" | "presentation" | "auto">("auto")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("nexus_token")
    if (!token) {
      router.push("/")
    }
  }, [router])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!description) return
    
    setIsLoading(true)
    setError("")

    try {
      const userStr = localStorage.getItem("nexus_current_user")
      if (!userStr) {
        router.push("/")
        return
      }

      const user = JSON.parse(userStr)
      const token = localStorage.getItem("nexus_token")

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          description,
          projectType,
          imageUrl: imagePreview
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create project")
        setIsLoading(false)
        return
      }

      // Save project and navigate to builder
      localStorage.setItem("nexus_current_project", JSON.stringify(data))
      router.push("/builder")
    } catch (err) {
      setError("Network error. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-8 py-6">
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          Nexus.ai
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-12">
        <h1 className="text-4xl font-bold mb-2">Create New Project</h1>
        <p className="text-gray-400 mb-12">Describe your project and let AI bring it to life</p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
            {error}
          </div>
        )}

        {/* Project Description */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-3">Project Description</label>
          <textarea
            placeholder="Describe what you want to build in detail..."
            className="w-full h-48 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none resize-none text-white placeholder:text-gray-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Image Upload */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-3">Reference Image (Optional)</label>
          <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition-all cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={isLoading}
            />
            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg mb-4" />
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-400">Click to upload an image</p>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Project Type Selector */}
        <div className="mb-12">
          <label className="block text-sm font-medium mb-3">Project Type</label>
          <div className="grid grid-cols-4 gap-4">
            {[
              { value: "auto", label: "Auto Detect" },
              { value: "website", label: "Website" },
              { value: "app", label: "App" },
              { value: "presentation", label: "Presentation" }
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setProjectType(type.value as any)}
                disabled={isLoading}
                className={`px-6 py-4 rounded-xl border transition-all ${
                  projectType === type.value
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!description || isLoading}
            className="animated-button"
          >
            <div className="dots_border">
              <div className="dots_border_inner"></div>
            </div>
            <Sparkles className="sparkle" />
            <span className="text_button">
              {isLoading ? "Creating..." : "Generate Project"}
            </span>

            <style jsx>{`
              .animated-button {
                --black-700: hsla(0 0% 12% / 1);
                --border_radius: 9999px;
                --transtion: 0.3s ease-in-out;
                --offset: 2px;

                cursor: pointer;
                position: relative;

                display: flex;
                align-items: center;
                gap: 0.5rem;

                transform-origin: center;

                padding: 1rem 2rem;
                background-color: transparent;

                border: none;
                border-radius: var(--border_radius);
                transform: scale(calc(1 + (var(--active, 0) * 0.1)));

                transition: transform var(--transtion);
              }

              .animated-button::before {
                content: "";
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);

                width: 100%;
                height: 100%;
                background-color: var(--black-700);

                border-radius: var(--border_radius);
                box-shadow: inset 0 0.5px hsl(0, 0%, 100%), inset 0 -1px 2px 0 hsl(0, 0%, 0%),
                  0px 4px 10px -4px hsla(0 0% 0% / calc(1 - var(--active, 0))),
                  0 0 0 calc(var(--active, 0) * 0.375rem) hsl(260 97% 50% / 0.75);

                transition: all var(--transtion);
                z-index: 0;
              }

              .animated-button::after {
                content: "";
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);

                width: 100%;
                height: 100%;
                background-color: hsla(260 97% 61% / 0.75);
                background-image: radial-gradient(
                    at 51% 89%,
                    hsla(266, 45%, 74%, 1) 0px,
                    transparent 50%
                  ),
                  radial-gradient(at 100% 100%, hsla(266, 36%, 60%, 1) 0px, transparent 50%),
                  radial-gradient(at 22% 91%, hsla(266, 36%, 60%, 1) 0px, transparent 50%);
                background-position: top;

                opacity: var(--active, 0);
                border-radius: var(--border_radius);
                transition: opacity var(--transtion);
                z-index: 2;
              }

              .animated-button:is(:hover, :focus-visible) {
                --active: 1;
              }

              .animated-button:active {
                transform: scale(1);
              }

              .animated-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
              }

              .animated-button .dots_border {
                --size_border: calc(100% + 2px);

                overflow: hidden;

                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);

                width: var(--size_border);
                height: var(--size_border);
                background-color: transparent;

                border-radius: var(--border_radius);
                z-index: -10;
              }

              .animated-button .dots_border::before {
                content: "";
                position: absolute;
                top: 30%;
                left: 50%;
                transform: translate(-50%, -50%);
                transform-origin: left;

                width: 100%;
                height: 2rem;
                background-color: white;

                mask: linear-gradient(transparent 0%, white 120%);
                animation: rotate 2s linear infinite;
              }

              @keyframes rotate {
                to {
                  transform: rotate(360deg);
                }
              }

              .animated-button .sparkle {
                position: relative;
                z-index: 10;
                width: 1.75rem;
                height: 1.75rem;
                color: hsl(0, 0%, 100%);
              }

              .animated-button .text_button {
                position: relative;
                z-index: 10;

                background-image: linear-gradient(
                  90deg,
                  hsla(0 0% 100% / 1) 0%,
                  hsla(0 0% 100% / var(--active, 0)) 120%
                );
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;

                font-size: 1rem;
                color: transparent;
              }
            `}</style>
          </button>
        </div>
      </main>
    </div>
  )
}