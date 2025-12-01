"use client"

import { useEffect, useRef } from "react"

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let rotation = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const size = 200

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(rotation)

      // Draw 3D cube wireframe
      const drawCube = (offset: number) => {
        ctx.strokeStyle = `rgba(138, 43, 226, ${0.3 + offset})`
        ctx.lineWidth = 2

        // Front face
        ctx.strokeRect(-size / 2, -size / 2, size, size)

        // Back face
        ctx.strokeRect(-size / 2 + offset, -size / 2 + offset, size, size)

        // Connecting lines
        ctx.beginPath()
        ctx.moveTo(-size / 2, -size / 2)
        ctx.lineTo(-size / 2 + offset, -size / 2 + offset)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(size / 2, -size / 2)
        ctx.lineTo(size / 2 + offset, -size / 2 + offset)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(-size / 2, size / 2)
        ctx.lineTo(-size / 2 + offset, size / 2 + offset)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(size / 2, size / 2)
        ctx.lineTo(size / 2 + offset, size / 2 + offset)
        ctx.stroke()
      }

      drawCube(50)

      ctx.restore()

      rotation += 0.005
      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-50"
    />
  )
}
