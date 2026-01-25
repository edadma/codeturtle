import type { HttpContext } from '@adonisjs/core/http'
import Program from '#models/program'
import { createProgramValidator, updateProgramValidator } from '#validators/program'

export default class ProgramsController {
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const visibility = request.input('visibility')

    const query = Program.query().orderBy('created_at', 'desc')

    if (visibility === 'public') {
      query.where('visibility', 'public')
    }

    const programs = await query.paginate(page, limit)
    return programs
  }

  async store({ request }: HttpContext) {
    const data = await createProgramValidator.validate(request.all())
    const program = await Program.create({
      title: data.title,
      code: data.code,
      description: data.description ?? null,
      visibility: data.visibility ?? 'private',
    })
    return program
  }

  async show({ params }: HttpContext) {
    const program = await Program.findOrFail(params.id)
    return program
  }

  async update({ params, request }: HttpContext) {
    const program = await Program.findOrFail(params.id)
    const data = await updateProgramValidator.validate(request.all())

    if (data.title !== undefined) program.title = data.title
    if (data.code !== undefined) program.code = data.code
    if (data.description !== undefined) program.description = data.description
    if (data.visibility !== undefined) program.visibility = data.visibility

    await program.save()
    return program
  }

  async destroy({ params }: HttpContext) {
    const program = await Program.findOrFail(params.id)
    await program.delete()
    return { message: 'Program deleted' }
  }
}
