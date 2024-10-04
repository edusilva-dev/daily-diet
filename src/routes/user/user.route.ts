import { FastifyInstance } from 'fastify'
import { string, z } from 'zod'
import { knex } from '../../configs/database'
import bcrypt from 'bcrypt'

export async function userRoutes(app: FastifyInstance) {
  app.post('/users', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: string(),
      email: string().email(),
      password: string(),
    })

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = crypto.randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    const { name, email, password } = createUserBodySchema.parse(request.body)

    const user = await knex('users').where('email', email).first()

    if (user) {
      return reply.status(200).send()
    }

    await knex('users').insert({
      id: crypto.randomUUID(),
      name,
      email,
      password: await bcrypt.hash(password, 8),
      session_id: sessionId,
    })

    reply.status(201).send({ message: 'User created successfully.' })
  })

  app.get('/users', async (request, reply) => {
    const users = await knex('users')

    reply.status(200).send({ users })
  })

  app.delete('/users/:id', async (request, reply) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionParamsSchema.parse(request.params)

    const isDeleted = Boolean(await knex('users').delete().where('id', id))

    if (isDeleted) {
      return reply.status(200).send({ message: 'User deleted registered.' })
    }
  })
}
