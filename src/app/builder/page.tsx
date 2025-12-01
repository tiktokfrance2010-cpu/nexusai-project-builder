"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Send, Eye, Code2, Database, FileText, Github, Rocket, Loader2 } from "lucide-react"

export default function Builder() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [input, setInput] = useState("")
  const [activeView, setActiveView] = useState<"preview" | "code" | "database" | "pages">("preview")
  const [currentPage, setCurrentPage] = useState("home")
  const [projectName, setProjectName] = useState("my-project")
  const [githubLinked, setGithubLinked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("nexus_current_user")
    const project = localStorage.getItem("nexus_current_project")
    
    if (!user) {
      router.push("/")
      return
    }

    if (project) {
      const projectData = JSON.parse(project)
      setProjectName(projectData.projectName || "my-project")
      setMessages([
        { role: "assistant", content: `مرحباً! سأساعدك في بناء ${projectData.projectType === "auto" ? "مشروعك" : projectData.projectType}. دعني أحلل وصفك...` },
        { role: "assistant", content: `رائع! سأقوم بإنشاء ${projectData.projectType === "auto" ? "موقع ويب" : projectData.projectType} بناءً على: "${projectData.description}"` }
      ])
    }
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, { role: 'user', content: userMessage }]
        }),
      })

      if (!response.ok) throw new Error('Request failed')
      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.delta) {
                assistantMessage += data.delta
                setMessages(prev => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { role: 'assistant', content: assistantMessage }
                  return updated
                })
              } else if (data.error) {
                setMessages(prev => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { 
                    role: 'assistant', 
                    content: `عذراً، حدث خطأ: ${data.error}. يرجى التحقق من مفتاح OpenAI API.` 
                  }
                  return updated
                })
              }
            } catch {
              // Parse error, skip
            }
          }
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي. يرجى التأكد من إعداد مفتاح OpenAI API.` 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeploy = () => {
    const deployUrl = `${projectName}.nexuse.ai`
    alert(`تم نشر مشروعك على: https://${deployUrl}`)
  }

  const handleGithubLink = () => {
    setGithubLinked(true)
    alert("تم ربط المشروع بـ GitHub! سيتم مزامنة الملفات تلقائياً.")
  }

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          Nexus.ai
        </div>

        <div className="flex items-center gap-4">
          {/* View Selector */}
          <div className="flex gap-2 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setActiveView("preview")}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                activeView === "preview" ? "bg-purple-600" : "hover:bg-white/10"
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => setActiveView("code")}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                activeView === "code" ? "bg-purple-600" : "hover:bg-white/10"
              }`}
            >
              <Code2 className="w-4 h-4" />
              Code
            </button>
            <button
              onClick={() => setActiveView("database")}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                activeView === "database" ? "bg-purple-600" : "hover:bg-white/10"
              }`}
            >
              <Database className="w-4 h-4" />
              Database
            </button>
            <button
              onClick={() => setActiveView("pages")}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                activeView === "pages" ? "bg-purple-600" : "hover:bg-white/10"
              }`}
            >
              <FileText className="w-4 h-4" />
              Pages
            </button>
          </div>

          {/* GitHub Link */}
          <button
            onClick={handleGithubLink}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition-all ${
              githubLinked
                ? "border-green-500 bg-green-500/20"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            <Github className="w-4 h-4" />
            {githubLinked ? "Linked" : "Link GitHub"}
          </button>

          {/* Deploy Button */}
          <button onClick={handleDeploy} className="deploy-button">
            <Rocket className="w-4 h-4" />
            <span>Deploy</span>

            <style jsx>{`
              .deploy-button {
                display: flex;
                align-items: center;
                font-family: inherit;
                cursor: pointer;
                font-weight: 500;
                font-size: 17px;
                padding: 0.8em 1.3em 0.8em 0.9em;
                color: white;
                background: #ad5389;
                background: linear-gradient(to right, #0f0c29, #302b63, #24243e);
                border: none;
                letter-spacing: 0.05em;
                border-radius: 16px;
                gap: 0.5rem;
                transition: transform 0.5s cubic-bezier(0.76, 0, 0.24, 1);
              }

              .deploy-button:hover {
                transform: translateY(-2px);
              }

              .deploy-button svg {
                transition: transform 0.5s cubic-bezier(0.76, 0, 0.24, 1);
              }

              .deploy-button:hover svg {
                transform: translateX(5px) rotate(30deg);
              }

              .deploy-button span {
                transition: transform 0.5s cubic-bezier(0.76, 0, 0.24, 1);
              }

              .deploy-button:hover span {
                transform: translateX(7px);
              }
            `}</style>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel - 30% */}
        <div className="w-[30%] border-r border-white/10 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg ${
                  msg.role === "user"
                    ? "bg-purple-600/20 border border-purple-500/30 ml-8"
                    : "bg-white/5 border border-white/10 mr-8"
                }`}
              >
                <div className="text-xs text-gray-400 mb-1">
                  {msg.role === "user" ? "أنت" : "مساعد الذكاء الاصطناعي"}
                </div>
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 mr-8 flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-400">جاري الكتابة...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="اكتب التغييرات المطلوبة..."
                className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 outline-none text-white placeholder:text-gray-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Panel - 70% */}
        <div className="flex-1 bg-[#111] p-6 overflow-auto">
          {activeView === "preview" && (
            <div className="bg-white rounded-lg h-full p-8 text-black">
              <h1 className="text-3xl font-bold mb-4">معاينة المشروع</h1>
              <p className="text-gray-600 mb-6">ستظهر معاينة مشروعك هنا أثناء بنائه.</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">🚀</div>
                <p className="text-xl font-semibold">جاري بناء مشروعك...</p>
                <p className="text-gray-500 mt-2">الذكاء الاصطناعي يقوم بإنشاء موقعك بناءً على الوصف</p>
              </div>
            </div>
          )}

          {activeView === "code" && (
            <div className="h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">ملفات المشروع</h2>
                <div className="text-sm text-gray-400">الكود المُنشأ</div>
              </div>
              <div className="bg-[#1e1e1e] rounded-lg p-6 h-[calc(100%-4rem)] overflow-auto font-mono text-sm">
                <div className="mb-4">
                  <div className="text-purple-400">// index.html</div>
                  <div className="text-gray-400 mt-2">
                    {'<!DOCTYPE html>'}
                    <br />
                    {'<html lang="ar">'}
                    <br />
                    {'  <head>'}
                    <br />
                    {'    <title>مشروعي</title>'}
                    <br />
                    {'  </head>'}
                    <br />
                    {'  <body>'}
                    <br />
                    {'    <h1>مرحباً بك في مشروعي</h1>'}
                    <br />
                    {'  </body>'}
                    <br />
                    {'</html>'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === "database" && (
            <div className="h-full">
              <h2 className="text-xl font-bold mb-4">سجلات قاعدة البيانات</h2>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3">البريد الإلكتروني</th>
                      <th className="text-left py-3">تاريخ الإنشاء</th>
                      <th className="text-left py-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/10">
                      <td className="py-3 text-gray-400">لا توجد سجلات بعد</td>
                      <td className="py-3 text-gray-400">-</td>
                      <td className="py-3 text-gray-400">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === "pages" && (
            <div className="h-full">
              <h2 className="text-xl font-bold mb-4">الصفحات</h2>
              <div className="grid grid-cols-3 gap-4">
                {["Home", "About", "Contact"].map((page) => (
                  <div
                    key={page}
                    className={`p-6 rounded-lg border cursor-pointer transition-all ${
                      currentPage === page.toLowerCase()
                        ? "border-purple-500 bg-purple-500/20"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                    onClick={() => setCurrentPage(page.toLowerCase())}
                  >
                    <FileText className="w-8 h-8 mb-3" />
                    <div className="font-semibold">{page}</div>
                    <div className="text-sm text-gray-400 mt-1">/{page.toLowerCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}