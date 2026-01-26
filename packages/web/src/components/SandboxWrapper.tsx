import { lazy, Suspense } from 'react'

const Sandbox = lazy(() => import('./Sandbox'))

export interface SandboxWrapperProps {
  size?: number
  canvasSize?: number
  speed?: number
}

export function SandboxWrapper(props: SandboxWrapperProps) {
  const size = props.size ?? 300
  return (
    <Suspense fallback={<div style={{ width: size * 2, height: size, background: '#0f172a' }} />}>
      <Sandbox {...props} />
    </Suspense>
  )
}

export default SandboxWrapper
