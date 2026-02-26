import React, { useRef, useEffect } from 'react'
import './Styles/AnimatedBackground.scss'

const AnimatedBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // handle high DPI screens
    const setSize = () => {
      const dpr = window.devicePixelRatio || 1
      const cssWidth = window.innerWidth
      const cssHeight = window.innerHeight
      canvas.style.width = cssWidth + 'px'
      canvas.style.height = cssHeight + 'px'
      canvas.width = Math.floor(cssWidth * dpr)
      canvas.height = Math.floor(cssHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      return { width: cssWidth, height: cssHeight }
    }

    let { width, height } = setSize()

    let fontSize = Math.max(10, Math.floor(Math.min(width, height) / 60))
    let columns = Math.max(10, Math.floor(width / fontSize))
    const drops = new Array(columns).fill(0).map(() => Math.floor(Math.random() * (height / fontSize)))
    const chars = ['0', '1']

    let rafId

    function draw() {

      // draw with slight translucent purple to be visible but subtle
      ctx.clearRect(0, 0, width, height)
      ctx.font = `${fontSize}px monospace`
      ctx.textBaseline = 'top'
      ctx.fillStyle = 'rgba(162,89,255,0.16)'

      for (let i = 0; i < columns; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(text, i * fontSize, Math.floor(drops[i] * fontSize))

        // randomize drop speed slightly
        drops[i] = drops[i] + (Math.random() * 0.8 + 0.4)

        if (drops[i] * fontSize > height && Math.random() > 0.985) {
          drops[i] = 0
        }
      }

      rafId = requestAnimationFrame(draw)
    }

    function handleResize() {
      const s = setSize()
      width = s.width
      height = s.height
      fontSize = Math.max(10, Math.floor(Math.min(width, height) / 60))
      columns = Math.max(10, Math.floor(width / fontSize))
      drops.length = columns
      for (let i = 0; i < columns; i++) drops[i] = drops[i] || Math.floor(Math.random() * (height / fontSize))
    }

    window.addEventListener('resize', handleResize)
    draw()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="animated-bg" aria-hidden>
      <canvas ref={canvasRef} />
    </div>
  )
}

export default AnimatedBackground
