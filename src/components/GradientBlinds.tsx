"use client"

import { useEffect, useRef, useState } from "react"

interface GradientBlindsProps {
  gradientColors?: string[]
  angle?: number
  noise?: number
  blindCount?: number
  blindMinWidth?: number
  spotlightRadius?: number
  spotlightSoftness?: number
  spotlightOpacity?: number
  mouseDampening?: number
  distortAmount?: number
  shineDirection?: "left" | "right"
  mixBlendMode?: string
}

export default function GradientBlinds({
  gradientColors = ["#FF9FFC", "#5227FF"],
  angle = 0,
  noise = 0.3,
  blindCount = 12,
  blindMinWidth = 50,
  spotlightRadius = 0.5,
  spotlightSoftness = 1,
  spotlightOpacity = 1,
  mouseDampening = 0.15,
  distortAmount = 0,
  shineDirection = "left",
  mixBlendMode = "lighten"
}: GradientBlindsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const currentMousePos = useRef({ x: 0.5, y: 0.5 })
  const targetMousePos = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetMousePos.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

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

    const animate = () => {
      // Smooth mouse interpolation
      currentMousePos.current.x +=
        (targetMousePos.current.x - currentMousePos.current.x) * mouseDampening
      currentMousePos.current.y +=
        (targetMousePos.current.y - currentMousePos.current.y) * mouseDampening

      setMousePos({ ...currentMousePos.current })

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw gradient blinds
      const blindWidth = Math.max(canvas.width / blindCount, blindMinWidth)
      const actualBlindCount = Math.ceil(canvas.width / blindWidth)

      for (let i = 0; i < actualBlindCount; i++) {
        const x = i * blindWidth
        const distanceFromMouse = Math.abs(
          currentMousePos.current.x * canvas.width - (x + blindWidth / 2)
        )
        const maxDistance = canvas.width / 2
        const distortFactor = 1 - Math.min(distanceFromMouse / maxDistance, 1)

        // Create gradient
        const gradient = ctx.createLinearGradient(
          x,
          0,
          x + blindWidth,
          canvas.height
        )

        // Apply gradient colors with angle
        const color1 = gradientColors[0]
        const color2 = gradientColors[1] || gradientColors[0]

        gradient.addColorStop(0, color1)
        gradient.addColorStop(1, color2)

        ctx.fillStyle = gradient

        // Add noise effect
        const noiseValue = noise * distortFactor * 20
        const offsetX = (Math.random() - 0.5) * noiseValue

        // Draw blind
        ctx.globalAlpha = spotlightOpacity * (0.3 + distortFactor * 0.7)
        ctx.fillRect(x + offsetX, 0, blindWidth, canvas.height)
      }

      // Add spotlight effect
      const spotX = currentMousePos.current.x * canvas.width
      const spotY = currentMousePos.current.y * canvas.height
      const radius = spotlightRadius * Math.max(canvas.width, canvas.height)

      const radialGradient = ctx.createRadialGradient(
        spotX,
        spotY,
        0,
        spotX,
        spotY,
        radius * spotlightSoftness
      )
      radialGradient.addColorStop(0, "rgba(255, 255, 255, 0.3)")
      radialGradient.addColorStop(1, "rgba(255, 255, 255, 0)")

      ctx.globalCompositeOperation = mixBlendMode as GlobalCompositeOperation
      ctx.fillStyle = radialGradient
      ctx.globalAlpha = spotlightOpacity
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.globalCompositeOperation = "source-over"
      ctx.globalAlpha = 1

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
    }
  }, [
    gradientColors,
    angle,
    noise,
    blindCount,
    blindMinWidth,
    spotlightRadius,
    spotlightSoftness,
    spotlightOpacity,
    mouseDampening,
    distortAmount,
    shineDirection,
    mixBlendMode
  ])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none w-full h-full"
      style={{ mixBlendMode: mixBlendMode as any }}
    />
  )
}
