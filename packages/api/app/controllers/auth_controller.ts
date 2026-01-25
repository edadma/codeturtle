import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator, loginValidator } from '#validators/auth'

export default class AuthController {
  async register({ request, auth, response }: HttpContext) {
    const data = await registerValidator.validate(request.all())

    const existingUser = await User.findBy('email', data.email)
    if (existingUser) {
      return response.conflict({ error: 'Email already registered' })
    }

    const user = await User.create(data)
    await auth.use('web').login(user)

    return user
  }

  async login({ request, auth, response }: HttpContext) {
    const { email, password } = await loginValidator.validate(request.all())

    const user = await User.verifyCredentials(email, password)
    if (!user) {
      return response.unauthorized({ error: 'Invalid credentials' })
    }

    await auth.use('web').login(user)

    return user
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.ok({ message: 'Logged out successfully' })
  }

  async me({ auth }: HttpContext) {
    return auth.use('web').user
  }
}
