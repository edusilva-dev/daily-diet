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
      date: z.coerce.date(),
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
      date: date.toISOString(),
      in_diet: inDiet,
      user_id: user!.id,
    })

    reply.status(201).send()
  })

  app.get('/meals', async (request, reply) => {
    const { user } = request

    const meals = await knex('meals').where('user_id', user!.id)

    reply.status(200).send({ meals })
  })

  app.put('/meals/:mealId', async (request, reply) => {
    const deleteMealBodySchema = z.object({
      mealId: z.string().uuid(),
    })

    const updateMealBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      date: z.string().optional(),
      inDiet: z.boolean().optional(),
    })

    const { mealId } = deleteMealBodySchema.parse(request.params)

    const mealToUpdate = updateMealBodySchema.parse(request.body)

    const { user } = request

    await knex('meals')
      .update(mealToUpdate)
      .where('id', mealId)
      .and.where('user_id', user!.id)

    reply.status(200).send({ message: 'Updated successfully.' })
  })

  app.delete('/meals/:mealId', async (request, reply) => {
    const deleteMealBodySchema = z.object({
      mealId: z.string().uuid(),
    })

    const { mealId } = deleteMealBodySchema.parse(request.params)

    const { user } = request

    await knex('meals')
      .delete()
      .where('id', mealId)
      .and.where('user_id', user!.id)

    reply.status(200).send()
  })
}
