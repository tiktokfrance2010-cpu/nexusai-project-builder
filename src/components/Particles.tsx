"use client"

import { useEffect, useRef } from "react"

interface ParticlesProps {
  particleColors?: string[]
  particleCount?: number
  particleSpread?: number
  speed?: number
  particleBaseSize?: number
  moveParticlesOnHover?: boolean
  alphaParticles?: boolean
  disableRotation?: boolean
}

export default function Particles({
  particleColors = ['#ffffff', '#ffffff'],
  particleCount = 200,
  particleSpread = 10,
  speed = 0.1,
  particleBaseSize = 100,
  moveParticlesOnHover = true,
  alphaParticles = false,
  disableRotation = false
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      rotation: number
      rotationSpeed: number
    }

    const particles: Particle[] = []

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * particleSpread + 2,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }

    if (moveParticlesOnHover) {
      window.addEventListener("mousemove", handleMouseMove)
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        // Move particles
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // Mouse interaction
        if (moveParticlesOnHover) {
          const dx = mousePos.current.x - particle.x
          const dy = mousePos.current.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 100) {
            particle.x -= dx * 0.01
            particle.y -= dy * 0.01
          }
        }

        // Update rotation
        if (!disableRotation) {
          particle.rotation += particle.rotationSpeed
        }

        // Draw particle
        ctx.save()
        ctx.translate(particle.x, particle.y)
        ctx.rotate(particle.rotation)
        
        const alpha = alphaParticles ? Math.random() * 0.5 + 0.3 : 1
        ctx.fillStyle = particle.color
        ctx.globalAlpha = alpha
        
        ctx.beginPath()
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.restore()
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    window.addEventListener("resize", handleResize)
    
    return () => {
      window.removeEventListener("resize", handleResize)
      if (moveParticlesOnHover) {
        window.removeEventListener("mousemove", handleMouseMove)
      }
    }
  }, [particleColors, particleCount, particleSpread, speed, particleBaseSize, moveParticlesOnHover, alphaParticles, disableRotation])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  )
}
