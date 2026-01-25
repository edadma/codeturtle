import vine from '@vinejs/vine'

const visibilityRule = vine.enum(['private', 'unlisted', 'public'] as const)

export const createProgramValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255),
    code: vine.string(),
    description: vine.string().trim().maxLength(1000).optional(),
    visibility: visibilityRule.optional(),
  })
)

export const updateProgramValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255).optional(),
    code: vine.string().optional(),
    description: vine.string().trim().maxLength(1000).optional().nullable(),
    visibility: visibilityRule.optional(),
  })
)
