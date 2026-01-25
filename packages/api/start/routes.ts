/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const ProgramsController = () => import('#controllers/programs_controller')
const AuthController = () => import('#controllers/auth_controller')

router.get('/', async () => ({ status: 'ok', name: 'Logo Playground API' }))

router
  .group(() => {
    // Auth routes (public)
    router.post('/auth/register', [AuthController, 'register']).as('auth.register')
    router.post('/auth/login', [AuthController, 'login']).as('auth.login')

    // Auth routes (protected)
    router
      .group(() => {
        router.post('/auth/logout', [AuthController, 'logout']).as('auth.logout')
        router.get('/auth/me', [AuthController, 'me']).as('auth.me')
      })
      .use(middleware.auth())

    // Programs routes (protected)
    router
      .group(() => {
        router.get('/programs', [ProgramsController, 'index']).as('programs.index')
        router.post('/programs', [ProgramsController, 'store']).as('programs.store')
        router.get('/programs/:id', [ProgramsController, 'show']).as('programs.show')
        router.put('/programs/:id', [ProgramsController, 'update']).as('programs.update')
        router.delete('/programs/:id', [ProgramsController, 'destroy']).as('programs.destroy')
      })
      .use(middleware.auth())
  })
  .prefix('/api')
