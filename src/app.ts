import fastify from 'fastify'
import { routes } from './routes'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)

app.get('/ping', (_, reply) => {
  reply.send({ ping: 'pong' })
})

app.register(routes)
