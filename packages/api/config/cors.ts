import env from '#start/env'
import { defineConfig } from '@adonisjs/cors'

const corsConfig = defineConfig({
  enabled: true,
  origin: (origin) => {
    // Allow localhost in development
    if (origin?.startsWith('http://localhost:')) {
      return true
    }
    // Allow configured frontend URL in production
    const frontendUrl = env.get('FRONTEND_URL')
    if (frontendUrl && origin === frontendUrl) {
      return true
    }
    return false
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
