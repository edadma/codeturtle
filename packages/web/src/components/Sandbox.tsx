import { useRef, useEffect, useCallback } from 'react'
import { useTheme } from '@aster-ui/prefixed'
import { Terminal } from '@aster-ui/prefixed/terminal'
import type { TerminalRef } from '@aster-ui/prefixed/terminal'
import { LogoAnimated } from '@edadma/logo'

export interface SandboxProps {
  /** Size in pixels for visible area (square) */
  size?: number
  /** Actual canvas size in pixels (larger than visible area) */
  canvasSize?: number
  /** Animation speed (0 = instant, higher = slower) */
  speed?: number
}

export function Sandbox({
  size = 300,
  canvasSize = 2000,
  speed = 10,
}: SandboxProps) {
  const { colors } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const logoRef = useRef<LogoAnimated | null>(null)
  const terminalRef = useRef<TerminalRef>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Initialize Logo instance
  useEffect(() => {
    if (canvasRef.current) {
      logoRef.current = new LogoAnimated(canvasRef.current)
      logoRef.current.setPathRendering(true)
      logoRef.current.setSpeed(speed)

      // Send Logo print output to terminal
      logoRef.current.setOutputHandler((text: string) => {
        terminalRef.current?.writeln(text)
      })

      // Handle errors
      logoRef.current.onError((errorMsg: string) => {
        terminalRef.current?.writeln(`\x1b[31mError: ${errorMsg}\x1b[0m`)
      })
    }

    return () => {
      if (logoRef.current) {
        logoRef.current.stop()
      }
    }
  }, [])

  // Center scroll view on mount
  useEffect(() => {
    if (scrollContainerRef.current && canvasRef.current) {
      const container = scrollContainerRef.current
      const canvas = canvasRef.current
      container.scrollLeft = (canvas.width - container.clientWidth) / 2
      container.scrollTop = (canvas.height - container.clientHeight) / 2
    }
  }, [])

  // Update canvas colors when theme changes
  useEffect(() => {
    if (logoRef.current) {
      logoRef.current.setBackgroundColor(colors.background)
      logoRef.current.setForegroundColor(colors.foreground)
    }
  }, [colors.background, colors.foreground])

  // Update speed when prop changes
  useEffect(() => {
    if (logoRef.current) {
      logoRef.current.setSpeed(speed)
    }
  }, [speed])

  // Handle terminal command
  const handleCommand = useCallback((line: string) => {
    if (!logoRef.current || !line.trim()) return

    const trimmed = line.trim().toLowerCase()

    // Handle clear commands
    if (trimmed === 'cs' || trimmed === 'clearscreen' || trimmed === 'clear') {
      logoRef.current.clear()
      return
    }

    try {
      const result = logoRef.current.execute(line)
      if (result !== undefined) {
        logoRef.current.setVariable('it', result)
        terminalRef.current?.writeln(String(result))
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      terminalRef.current?.writeln(`\x1b[31mError: ${errorMsg}\x1b[0m`)
    }
  }, [])

  return (
    <div className="not-content sandbox-container">
      {/* Terminal */}
      <div
        className="relative overflow-hidden"
        style={{ width: size, height: size, background: colors.background }}
      >
        <div className="absolute inset-0">
          <Terminal
            ref={terminalRef}
            readline
            prompt={'\x1b[32m> \x1b[0m'}
            onLine={handleCommand}
            onReady={(term) => {
              term.writeln('Type Logo commands here.')
              term.writeln('')
              term.focus()
            }}
            style={{ height: '100%', width: '100%' }}
          />
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={scrollContainerRef}
        className="overflow-auto"
        style={{ width: size, height: size, borderLeft: '1px solid var(--sl-color-gray-5)' }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          style={{ backgroundColor: colors.background }}
        />
      </div>
    </div>
  )
}

export default Sandbox
