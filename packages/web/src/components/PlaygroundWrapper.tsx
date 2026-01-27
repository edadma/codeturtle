import { lazy, Suspense } from 'react'

const Playground = lazy(() => import('./Playground'))

export function PlaygroundWrapper() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading playground...</div>}>
      <Playground />
    </Suspense>
  )
}

export default PlaygroundWrapper
