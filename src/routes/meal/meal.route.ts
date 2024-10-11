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

  app.get('/meals/:mealId', async (request, reply) => {
    const { user } = request

    const mealIdParamSchema = z.object({
      mealId: z.string().uuid(),
    })
    const { mealId } = mealIdParamSchema.parse(request.params)

    const meal = await knex('meals')
      .where({
        id: mealId,
        user_id: user!.id,
      })
      .first()

    reply.status(200).send({ meal })
  })

  app.put('/meals/:mealId', async (request, reply) => {
    const { user } = request

    const mealIdParamSchema = z.object({
      mealId: z.string().uuid(),
    })

    const updateMealBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      date: z.string().optional(),
      inDiet: z.boolean().optional(),
    })

    const { mealId } = mealIdParamSchema.parse(request.params)

    const mealToUpdate = updateMealBodySchema.parse(request.body)

    await knex('meals').update(mealToUpdate).where({
      id: mealId,
      user_id: user!.id,
    })

    reply.status(200).send({ message: 'Updated successfully.' })
  })

  app.delete('/meals/:mealId', async (request, reply) => {
    const { user } = request

    const deleteMealBodySchema = z.object({
      mealId: z.string().uuid(),
    })

    const { mealId } = deleteMealBodySchema.parse(request.params)

    await knex('meals').delete().where({
      id: mealId,
      user_id: user!.id,
    })

    reply.status(200).send()
  })

  app.get('/meals/reports', async (request, reply) => {
    const { user } = request

    const recordedMeals = await knex('meals')
      .where({
        user_id: user!.id,
      })
      .orderBy('date', 'desc')

    const mealsInDiet = await knex('meals')
      .where({
        user_id: user!.id,
        in_diet: true,
      })
      .count('id', { as: 'mealsInDiet' })
      .first()

    const mealsOutDiet = await knex('meals')
      .where({
        user_id: user!.id,
        in_diet: false,
      })
      .count('id', { as: 'mealsOutDiet' })
      .first()

    const { bestOnDietSequence } = recordedMeals.reduce(
      (acc, meal) => {
        if (meal.in_diet) {
          acc.currentSequence += 1
        } else {
          acc.currentSequence = 0
        }

        if (acc.currentSequence > acc.bestOnDietSequence) {
          acc.bestOnDietSequence = acc.currentSequence
        }

        return acc
      },
      { bestOnDietSequence: 0, currentSequence: 0 },
    )

    reply.status(200).send({
      reports: {
        recordedMeals: recordedMeals.length,
        mealsInDiet: mealsInDiet?.mealsInDiet,
        mealsOutDiet: mealsOutDiet?.mealsOutDiet,
        bestOnDietSequence,
      },
    })
  })
}
