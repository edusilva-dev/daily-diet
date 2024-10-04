import { FastifyInstance } from 'fastify'
import { userRoutes } from './user'
import { mealRoutes } from './meal'
import { authRoutes } from './auth'

export async function routes(app: FastifyInstance) {
  app.register(userRoutes)

  app.register(authRoutes)

  app.register(mealRoutes)
}
