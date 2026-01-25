import { useRef, useEffect, useCallback } from 'react'
import { useTheme } from '@aster-ui/prefixed'
import { Terminal } from '@aster-ui/prefixed/terminal'
import type { TerminalRef } from '@aster-ui/prefixed/terminal'
import { LogoAnimated } from '@edadma/logo'

export interface SandboxProps {
  /** Canvas size in pixels (square) */
  canvasSize?: number
  /** Terminal height in pixels */
  terminalHeight?: number
  /** Animation speed (0 = instant, higher = slower) */
  speed?: number
}

export function Sandbox({
  canvasSize = 300,
  terminalHeight = 125,
  speed = 10,
}: SandboxProps) {
  const { colors } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const logoRef = useRef<LogoAnimated | null>(null)
  const terminalRef = useRef<TerminalRef>(null)

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
    <div className="not-content sandbox-container" style={{ maxWidth: canvasSize + 16 }}>
      {/* Canvas */}
      <div className="sandbox-canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="sandbox-canvas"
          style={{ backgroundColor: colors.background }}
        />
      </div>

      {/* Terminal */}
      <div
        className="sandbox-terminal-wrapper"
        style={{ height: terminalHeight }}
      >
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
  )
}

export default Sandbox
