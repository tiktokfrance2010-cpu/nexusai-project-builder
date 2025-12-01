"use client"

import { useState } from "react"
import { User } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "login" | "signup"
  onSuccess: () => void
}

export default function AuthModal({ isOpen, onClose, mode, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (mode === "login") {
        const response = await fetch("/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Login failed")
          setIsLoading(false)
          return
        }

        // Save token and user data
        localStorage.setItem("nexus_token", data.token)
        localStorage.setItem("nexus_current_user", JSON.stringify(data.user))
        
        onSuccess()
        onClose()
      } else {
        const response = await fetch("/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Registration failed")
          setIsLoading(false)
          return
        }

        // Auto-login after registration
        const loginResponse = await fetch("/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        })

        const loginData = await loginResponse.json()

        if (!loginResponse.ok) {
          setError("Registration successful, but login failed. Please try logging in.")
          setIsLoading(false)
          return
        }

        localStorage.setItem("nexus_token", loginData.token)
        localStorage.setItem("nexus_current_user", JSON.stringify(loginData.user))
        
        onSuccess()
        onClose()
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="auth-container" onClick={(e) => e.stopPropagation()}>
        <div className="login-box">
          <form className="form" onSubmit={handleSubmit}>
            <div className="logo">
              <User className="user" size={24} />
            </div>
            <div className="header">
              {mode === "login" ? "Sign In" : "Sign Up"}
            </div>
            <input
              type="email"
              placeholder="Email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <input
              type="password"
              placeholder="Password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={6}
            />
            {error && <div className="text-red-500 text-xs">{error}</div>}
            <button type="submit" className="button sign-in" disabled={isLoading}>
              {isLoading ? "Loading..." : mode === "login" ? "Sign In" : "Sign Up"}
            </button>
            <div className="footer">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <a href="#" className="link" onClick={(e) => { e.preventDefault(); onClose(); }}>
                {mode === "login" ? "Sign Up" : "Sign In"}
              </a>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          --form-width: 315px;
          --aspect-ratio: 1.33;
          --login-box-color: #272727;
          --input-color: #3a3a3a;
          --button-color: #373737;
          --footer-color: rgba(255, 255, 255, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
          background: var(--login-box-color);
          border-radius: 24px;
          width: calc(var(--form-width) + 1px);
          height: calc(var(--form-width) * var(--aspect-ratio) + 1px);
          z-index: 8;
          box-shadow:
            0 4px 8px rgba(0, 0, 0, 0.2),
            0 8px 16px rgba(0, 0, 0, 0.2),
            0 0 8px rgba(255, 255, 255, 0.1),
            0 0 16px rgba(255, 255, 255, 0.08);
        }

        .auth-container::before {
          content: "";
          position: absolute;
          inset: -50px;
          z-index: -2;
          background: conic-gradient(
            from 45deg,
            transparent 75%,
            #fff,
            transparent 100%
          );
          animation: spin 4s ease-in-out infinite;
        }

        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }

        .login-box {
          background: var(--login-box-color);
          border-radius: 24px;
          padding: 28px;
          width: var(--form-width);
          height: calc(var(--form-width) * var(--aspect-ratio));
          position: absolute;
          z-index: 10;
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          box-shadow:
            inset 0 40px 60px -8px rgba(255, 255, 255, 0.12),
            inset 4px 0 12px -6px rgba(255, 255, 255, 0.12),
            inset 0 0 12px -4px rgba(255, 255, 255, 0.12);
        }

        .form {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          gap: 10px;
        }

        .logo {
          width: 65px;
          height: 65px;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.2),
            rgba(0, 0, 0, 0.2)
          );
          box-shadow:
            8px 8px 16px rgba(0, 0, 0, 0.2),
            -8px -8px 16px rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          border: 2px solid #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        .logo::before {
          content: "";
          position: absolute;
          bottom: 10px;
          width: 50%;
          height: 20%;
          border-top-left-radius: 40px;
          border-top-right-radius: 40px;
          border-bottom-right-radius: 20px;
          border-bottom-left-radius: 20px;
          border: 2.5px solid #fff;
        }

        .logo::after {
          content: "";
          position: absolute;
          top: 10px;
          width: 30%;
          height: 30%;
          border-radius: 50%;
          border: 2.5px solid #fff;
        }

        .user {
          position: absolute;
          height: 50px;
          color: #fff;
        }

        .header {
          width: 100%;
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          padding: 6px;
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .input {
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 12px;
          background: var(--input-color);
          color: white;
          outline: none;
          font-size: 14px;
        }

        .input:focus {
          border: 1px solid #fff;
        }

        .button {
          width: 100%;
          height: 40px;
          border: none;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: grid;
          place-content: center;
          gap: 10px;
          background: var(--button-color);
          color: white;
          transition: 0.3s;
          box-shadow:
            inset 0px 3px 6px -4px rgba(255, 255, 255, 0.6),
            inset 0px -3px 6px -2px rgba(0, 0, 0, 0.8);
        }

        .sign-in {
          margin-top: 5px;
        }

        .button:hover {
          background: rgba(255, 255, 255, 0.25);
          box-shadow:
            inset 0px 3px 6px rgba(255, 255, 255, 0.6),
            inset 0px -3px 6px rgba(0, 0, 0, 0.8),
            0px 0px 8px rgba(255, 255, 255, 0.05);
        }

        .footer {
          width: 100%;
          text-align: left;
          color: var(--footer-color);
          font-size: 12px;
        }

        .footer .link {
          position: relative;
          color: var(--footer-color);
          font-weight: 600;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer .link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -2px;
          width: 0;
          border-radius: 6px;
          height: 1px;
          background: currentColor;
          transition: width 0.3s ease;
        }

        .footer .link:hover {
          color: #fff;
        }

        .footer .link:hover::after {
          width: 100%;
        }
      `}</style>
    </div>
  )
}