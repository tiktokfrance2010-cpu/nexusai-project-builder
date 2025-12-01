"use client"

import { useEffect, useRef } from "react"

interface RippleGridProps {
  enableRainbow?: boolean
  gridColor?: string
  rippleIntensity?: number
  gridSize?: number
  gridThickness?: number
  mouseInteraction?: boolean
  mouseInteractionRadius?: number
  opacity?: number
}

export default function RippleGrid({
  enableRainbow = false,
  gridColor = "#ffffff",
  rippleIntensity = 0.05,
  gridSize = 10,
  gridThickness = 15,
  mouseInteraction = true,
  mouseInteractionRadius = 1.2,
  opacity = 0.8
}: RippleGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const animationFrame = useRef<number>()
  const time = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }

    if (mouseInteraction) {
      canvas.addEventListener("mousemove", handleMouseMove)
    }

    const animate = () => {
      time.current += 0.016
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const cols = Math.ceil(canvas.width / gridSize)
      const rows = Math.ceil(canvas.height / gridSize)

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * gridSize
          const y = j * gridSize

          let distortion = 0
          if (mouseInteraction) {
            const dx = x - mousePos.current.x
            const dy = y - mousePos.current.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            const maxDistance = gridSize * mouseInteractionRadius * 10
            
            if (distance < maxDistance) {
              distortion = Math.sin((distance - time.current * 50) * 0.1) * rippleIntensity * 100
            }
          } else {
            distortion = Math.sin(x * 0.05 + time.current) * Math.cos(y * 0.05 + time.current) * rippleIntensity * 100
          }

          let color = gridColor
          if (enableRainbow) {
            const hue = ((x + y + time.current * 50) % 360)
            color = `hsl(${hue}, 70%, 60%)`
          }

          ctx.strokeStyle = color
          ctx.globalAlpha = opacity
          ctx.lineWidth = gridThickness / 10

          // Vertical line
          ctx.beginPath()
          ctx.moveTo(x + distortion, 0)
          ctx.lineTo(x + distortion, canvas.height)
          ctx.stroke()

          // Horizontal line
          ctx.beginPath()
          ctx.moveTo(0, y + distortion)
          ctx.lineTo(canvas.width, y + distortion)
          ctx.stroke()
        }
      }

      animationFrame.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
      if (mouseInteraction) {
        canvas.removeEventListener("mousemove", handleMouseMove)
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [enableRainbow, gridColor, rippleIntensity, gridSize, gridThickness, mouseInteraction, mouseInteractionRadius, opacity])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: mouseInteraction ? "auto" : "none" }}
    />
  )
}
