import { lazy, Suspense } from 'react'

const Sandbox = lazy(() => import('./Sandbox'))

export interface SandboxWrapperProps {
  canvasSize?: number
  terminalHeight?: number
  speed?: number
}

export function SandboxWrapper(props: SandboxWrapperProps) {
  return (
    <Suspense fallback={<div style={{ height: (props.canvasSize ?? 300) + (props.terminalHeight ?? 150) + 40, background: '#0f172a', borderRadius: '0.75rem' }} />}>
      <Sandbox {...props} />
    </Suspense>
  )
}

export default SandboxWrapper
