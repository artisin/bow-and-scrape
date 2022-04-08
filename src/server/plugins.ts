import cors, { FastifyCorsOptions } from 'fastify-cors';
import sensible, { SensibleOptions } from "fastify-sensible";
import multipart, { FastifyMultipartOptions } from "fastify-multipart";
import fp from 'fastify-plugin';


export default fp<FastifyCorsOptions>(async (fastify, opts) => {
/**
 * Fastify-cors enables the use of CORS in a Fastify application.
 *
 * @see https://github.com/fastify/fastify-cors
 */
  fastify.register(cors, {
    ...opts,
  });


/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
  fastify.register(sensible, {
    errorHandler: false,
  });


/**
 * Multipart support for Fastify
 *
 * @link https://github.com/fastify/fastify-multipart
 */
fastify.register(multipart, {
    attachFieldsToBody: true,
  });
});