import Fastify from 'fastify'
// import url from 'url'
import GracefulServer from '@gquittet/graceful-server'
import plugins from './plugins';
import routeScraper from './route-scraper';

const fastify = Fastify({
  logger: true
})

const gracefulServer = GracefulServer(fastify.server)

gracefulServer.on(GracefulServer.READY, () => {
  console.log('Server is ready')
})

gracefulServer.on(GracefulServer.SHUTTING_DOWN, () => {
  console.log('Server is shutting down')
})

gracefulServer.on(GracefulServer.SHUTDOWN, error => {
  console.log('Server is down because of', error.message)
})

// Declare a route
fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})
fastify.register(plugins);
fastify.register(routeScraper);

// Run the server!
const start = async () => {
  try {
    await fastify.listen(8080)
    const addy = fastify?.server?.address();
    fastify.log.info(`server listening on ${typeof addy === 'string' ? addy : addy?.port}`)
    gracefulServer.setReady()
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()

