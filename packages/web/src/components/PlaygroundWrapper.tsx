import { lazy, Suspense } from 'react'

const Playground = lazy(() => import('./Playground'))

export function PlaygroundWrapper() {
  return (
    <Suspense fallback={<div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-base-200">Loading playground...</div>}>
      <Playground />
    </Suspense>
  )
}

export default PlaygroundWrapper
