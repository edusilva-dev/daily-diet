import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '@configs/database'
import { checkSessionIdExists } from '@middlewares/check-session-id-exists'

export async function mealRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkSessionIdExists)

  app.post('/meals', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string().date(),
      inDiet: z.boolean(),
    })

    const { user } = request

    const { name, description, date, inDiet } = createMealBodySchema.parse(
      request.body,
    )

    await knex('meals').insert({
      id: crypto.randomUUID(),
      name,
      description,
      date,
      inDiet,
      user_id: user!.id,
    })

    reply.status(201).send()
  })

  app.get(
    '/meals',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { user } = request

      await knex('meals').where('user_id', user!.id)

      reply.status(201).send()
    },
  )
}
