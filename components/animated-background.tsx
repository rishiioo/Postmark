'use client'

import { useEffect, useRef, useState } from 'react'

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const [blobs, setBlobs] = useState<Blob[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize particles
    const initParticles: Particle[] = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.03,
      vy: (Math.random() - 0.5) * 0.03,
      opacity: Math.random() * 0.6 + 0.25,
      color: Math.random() > 0.5 ? 'rgba(120, 130, 255,' : 'rgba(100, 200, 255,',
    }))

    // Initialize blobs (aurora-like shapes)
    const initBlobs: Blob[] = [
      {
        x: canvas.width * 0.15,
        y: canvas.height * 0.15,
        radius: canvas.width * 0.5,
        hue: 250, // indigo
        speed: 0.0008,
        angle: 0,
      },
      {
        x: canvas.width * 0.85,
        y: canvas.height * 0.25,
        radius: canvas.width * 0.45,
        hue: 190, // cyan/sky
        speed: 0.0006,
        angle: Math.PI,
      },
      {
        x: canvas.width * 0.5,
        y: canvas.height * 0.85,
        radius: canvas.width * 0.4,
        hue: 280, // violet
        speed: 0.001,
        angle: Math.PI / 2,
      },
    ]

    setParticles(initParticles)
    setBlobs(initBlobs)

    let lastTime = 0

    function resize() {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight
      canvas.style.width = '100%'
      canvas.style.height = '100%'
    }

    function animate(time: number) {
      const dt = time - lastTime
      lastTime = time

      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw subtle grid pattern
      drawGrid(ctx, canvas.width, canvas.height, time)

      // Draw blobs (aurora effect)
      drawBlobs(ctx, initBlobs, canvas.width, canvas.height, dt)

      // Draw particles
      drawParticles(ctx, initParticles, canvas.width, canvas.height, dt, time)

      // Draw connections between nearby particles
      drawConnections(ctx, initParticles, canvas.width, canvas.height)

      animationRef.current = requestAnimationFrame(animate)
    }

    function drawGrid(
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      time: number
    ) {
      const gridSize = 60
      const offset = (time * 0.001) % gridSize

      ctx.strokeStyle = 'rgba(99, 102, 241, 0.03)'
      ctx.lineWidth = 0.5

      // Vertical lines
      for (let x = -offset; x < width + offset; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = -offset; y < height + offset; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
    }

    function drawBlobs(
      ctx: CanvasRenderingContext2D,
      blobs: Blob[],
      width: number,
      height: number,
      dt: number
    ) {
      blobs.forEach((blob) => {
        // Update blob position with organic movement
        blob.angle += blob.speed * dt
        const orbitX = Math.cos(blob.angle) * width * 0.15
        const orbitY = Math.sin(blob.angle * 0.7) * height * 0.1

        const cx = blob.x + orbitX
        const cy = blob.y + orbitY

        // Create radial gradient for blob
        const gradient = ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          blob.radius
        )
        gradient.addColorStop(0, `hsla(${blob.hue}, 70%, 60%, 0.15)`)
        gradient.addColorStop(0.3, `hsla(${blob.hue}, 70%, 50%, 0.08)`)
        gradient.addColorStop(1, `hsla(${blob.hue}, 70%, 40%, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.ellipse(
          cx,
          cy,
          blob.radius * (1 + Math.sin(blob.angle * 0.05) * 0.15),
          blob.radius * (1 + Math.cos(blob.angle * 0.03) * 0.15),
          Math.sin(blob.angle) * 0.3,
          0,
          Math.PI * 2
        )
        ctx.fill()
      })
    }

    function drawParticles(
      ctx: CanvasRenderingContext2D,
      particles: Particle[],
      width: number,
      height: number,
      dt: number,
      time: number
    ) {
      particles.forEach((p) => {
        // Update position
        p.x += p.vx * dt * 0.02
        p.y += p.vy * dt * 0.02

        // Add subtle wave motion
        p.x += Math.sin(p.y * 0.01 + time * 0.0001) * 0.02
        p.y += Math.cos(p.x * 0.01 + time * 0.0001) * 0.02

        // Wrap around edges
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        if (p.y > height + 10) p.y = -10

        // Draw particle
        ctx.fillStyle = `${p.color}${p.opacity})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    function drawConnections(
      ctx: CanvasRenderingContext2D,
      particles: Particle[],
      width: number,
      height: number
    ) {
      const maxDist = 180
      const maxDistSq = maxDist * maxDist

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distSq = dx * dx + dy * dy

          if (distSq < maxDistSq) {
            const opacity = (1 - distSq / maxDistSq) * 0.25
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    resize()
    window.addEventListener('resize', resize)
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  )
}

interface Particle {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  opacity: number
  color: string
}

interface Blob {
  x: number
  y: number
  radius: number
  hue: number
  speed: number
  angle: number
}