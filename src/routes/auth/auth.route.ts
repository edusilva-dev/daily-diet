import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { knex } from '@configs/database'

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    const getUserBodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    })

    const { email, password } = getUserBodySchema.parse(request.body)

    const user = await knex('users').where('email', email).first()

    if (!user) {
      return reply.status(200).send()
    }

    const isPasswordCorrect = await bcrypt.compare(password, user!.password)

    if (!isPasswordCorrect) {
      return reply.status(200).send({ message: 'Password is incorrect.' })
    }

    reply.setCookie('sessionId', user.session_id)

    reply.status(200).send()
  })

  app.post('/logout', (request, reply) => {
    reply.setCookie('sessionId', '')

    reply.status(200).send()
  })
}
