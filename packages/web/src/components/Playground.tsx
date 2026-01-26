import { useState, useRef, useEffect, useCallback } from 'react'
import { Button, Card, Space, Splitter, useTheme, Range, Tooltip } from '@aster-ui/prefixed'
import { CodeEditor } from '@aster-ui/prefixed/codeeditor'
import { EditorView } from '@codemirror/view'
import { Terminal } from '@aster-ui/prefixed/terminal'
import type { TerminalRef } from '@aster-ui/prefixed/terminal'
import { LogoAnimated } from '@edadma/logo'

const editorTheme = EditorView.theme({
  '.cm-gutters': {
    backgroundColor: 'oklch(var(--b3))',
    borderRight: '2px solid oklch(var(--bc) / 0.2)',
    paddingRight: '4px',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    fontSize: '0.75em',
    opacity: '0.4',
    padding: '0 12px 0 8px',
  },
  '.cm-content': {
    outline: 'none',
  },
  '&.cm-editor.cm-focused': {
    outline: 'none',
  },
})

const EXAMPLES = {
  square: `repeat 4 [fd 100 rt 90]
`,
  triangle: `repeat 3 [fd 100 rt 120]
`,
  star: `repeat 5 [fd 100 rt 144]
`,
  spiral: `for [i 1 200] [fd :i / 10 rt 15]
`,
  flower: `repeat 36 [rt 10 repeat 6 [fd 50 rt 60]]
`,
  tree: `to tree :size
  if :size < 5 [fd :size bk :size stop]
  fd :size / 3
  lt 30 tree :size * 2 / 3 rt 30
  fd :size / 6
  rt 25 tree :size / 2 lt 25
  fd :size / 3
  rt 25 tree :size / 2 lt 25
  fd :size / 6
  bk :size
end
tree 150
`,
  fractal: `to koch :size :depth
  if :depth = 0 [fd :size stop]
  koch :size / 3 :depth - 1
  lt 60
  koch :size / 3 :depth - 1
  rt 120
  koch :size / 3 :depth - 1
  lt 60
  koch :size / 3 :depth - 1
end
to snowflake :size :depth
  repeat 3 [koch :size :depth rt 120]
end
pu bk 50 lt 90 fd 150 rt 90 pd
snowflake 300 4
`,
}

export function Playground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const logoRef = useRef<LogoAnimated | null>(null)
  const terminalRef = useRef<TerminalRef>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [code, setCode] = useState(EXAMPLES.square)
  const [speed, setSpeed] = useState(20)
  const [isRunning, setIsRunning] = useState(false)
  const { colors } = useTheme()

  useEffect(() => {
    if (canvasRef.current) {
      logoRef.current = new LogoAnimated(canvasRef.current)
      logoRef.current.setPathRendering(true)
      logoRef.current.setSpeed(speed)

      logoRef.current.setOutputHandler((text: string) => {
        terminalRef.current?.writeln(text)
      })

      logoRef.current.onComplete(() => {
        setIsRunning(false)
      })

      logoRef.current.onError((error: string) => {
        terminalRef.current?.writeln(`\x1b[31mError: ${error}\x1b[0m`)
        setIsRunning(false)
      })
    }
  }, [])

  useEffect(() => {
    if (scrollContainerRef.current && canvasRef.current) {
      const container = scrollContainerRef.current
      const canvas = canvasRef.current
      container.scrollLeft = (canvas.width - container.clientWidth) / 2
      container.scrollTop = (canvas.height - container.clientHeight) / 2
    }
  }, [])

  useEffect(() => {
    if (logoRef.current) {
      logoRef.current.setBackgroundColor(colors.background)
      logoRef.current.setForegroundColor(colors.foreground)
    }
  }, [colors.background, colors.foreground])

  useEffect(() => {
    if (logoRef.current) {
      logoRef.current.setSpeed(speed)
    }
  }, [speed])

  const runProgram = useCallback(() => {
    if (!logoRef.current) return

    try {
      logoRef.current.clear()
      setIsRunning(true)
      logoRef.current.run(code)
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      terminalRef.current?.writeln(`\x1b[31mError: ${errorMsg}\x1b[0m`)
      setIsRunning(false)
    }
  }, [code])

  const stopProgram = useCallback(() => {
    if (logoRef.current) {
      logoRef.current.stop()
      setIsRunning(false)
    }
  }, [])

  const centerScrollView = useCallback(() => {
    if (scrollContainerRef.current && canvasRef.current) {
      const container = scrollContainerRef.current
      const canvas = canvasRef.current
      container.scrollLeft = (canvas.width - container.clientWidth) / 2
      container.scrollTop = (canvas.height - container.clientHeight) / 2
    }
  }, [])

  const clearCanvas = useCallback(() => {
    if (logoRef.current) {
      logoRef.current.clear()
    }
    centerScrollView()
  }, [centerScrollView])

  const clearTerminal = useCallback(() => {
    terminalRef.current?.clear()
    terminalRef.current?.focus()
  }, [])

  const handleCommand = useCallback((line: string) => {
    if (!logoRef.current || !line.trim()) return

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

  const loadExample = useCallback((name: keyof typeof EXAMPLES) => {
    setCode(EXAMPLES[name])
  }, [])

  const exampleButtons = (
    <Space size="xs" wrap>
      {Object.keys(EXAMPLES).map((name) => (
        <Button
          key={name}
          size="xs"
          variant="soft"
          onClick={() => loadExample(name as keyof typeof EXAMPLES)}
        >
          {name}
        </Button>
      ))}
    </Space>
  )

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-1 min-h-0">
        <Splitter defaultSizes={[50, 50]} className="h-full">
          <Splitter.Panel minSize={300}>
            <Splitter direction="vertical" defaultSizes={[70, 30]} className="h-full">
              <Splitter.Panel minSize={150}>
                <Card
                  title={<span className="flex items-center gap-1">Editor <Tooltip position="bottom" tip="Write your Logo program here"><span className="opacity-50 cursor-help">?</span></Tooltip></span>}
                  extra={exampleButtons}
                  className="h-full"
                  bodyClassName="flex flex-col h-full"
                >
                  <Space direction="vertical" size="md" className="flex-1 flex flex-col">
                    <CodeEditor
                      value={code}
                      onChange={setCode}
                      language="plaintext"
                      className="flex-1 min-h-0 w-full"
                      placeholder="Enter Logo code here..."
                      lineNumbers
                      highlightActiveLine
                      bracketMatching
                      closeBrackets
                      indentWithTab
                      bordered
                      autoFocus
                      extensions={[editorTheme]}
                    />

                    <Space size="sm" className="items-center flex-wrap">
                      <Button color="primary" onClick={runProgram} disabled={isRunning}>
                        Run
                      </Button>
                      {isRunning && (
                        <Button color="error" variant="outline" onClick={stopProgram}>
                          Stop
                        </Button>
                      )}
                      <Button variant="outline" onClick={clearCanvas} disabled={isRunning}>
                        Clear
                      </Button>
                      <span className="text-sm text-base-content/70 ml-2">Speed:</span>
                      <Range
                        min={0}
                        max={100}
                        value={100 - speed}
                        onChange={(value) => setSpeed(100 - value)}
                        size="sm"
                        className="w-24"
                      />
                      <span className="text-sm text-base-content/70 w-12">
                        {speed === 0 ? 'Instant' : speed >= 80 ? 'Slow' : speed >= 40 ? 'Medium' : 'Fast'}
                      </span>
                    </Space>
                  </Space>
                </Card>
              </Splitter.Panel>

              <Splitter.Panel minSize={100}>
                <Card
                  title={<span className="flex items-center gap-1">Terminal <Tooltip position="bottom" tip="See output and type commands directly"><span className="opacity-50 cursor-help">?</span></Tooltip></span>}
                  extra={<Button size="xs" variant="ghost" onClick={clearTerminal}>Clear</Button>}
                  className="h-full"
                  bodyClassName="flex flex-col h-full"
                >
                  <div className="flex-1 min-h-0 relative overflow-hidden">
                    <div className="absolute inset-0">
                      <Terminal
                        ref={terminalRef}
                        readline
                        prompt={'\x1b[32m> \x1b[0m'}
                        onLine={handleCommand}
                        onReady={(term) => {
                          term.writeln('Output and errors appear here.')
                          term.writeln('You can also type commands directly.')
                          term.writeln('')
                        }}
                        style={{ height: '100%', width: '100%' }}
                      />
                    </div>
                  </div>
                </Card>
              </Splitter.Panel>
            </Splitter>
          </Splitter.Panel>

          <Splitter.Panel minSize={300}>
            <Card
              title={<span className="flex items-center gap-1">Canvas <Tooltip position="bottom" tip="Watch the turtle draw"><span className="opacity-50 cursor-help">?</span></Tooltip></span>}
              className="h-full"
              bodyClassName="h-full"
            >
              <div
                ref={scrollContainerRef}
                className="h-full overflow-auto"
              >
                <canvas
                  ref={canvasRef}
                  width={2000}
                  height={2000}
                  className="border border-base-300"
                  style={{ backgroundColor: colors.background }}
                />
              </div>
            </Card>
          </Splitter.Panel>
        </Splitter>
      </div>
    </div>
  )
}

export default Playground
