import { FastifyPluginAsync } from 'fastify'
import {
  Scraper,
} from '../scraper'

const scraperRoute: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  // Refer https://swagger.io/docs/specification/describing-request-body/

  fastify.post<{
    Body: {
      url: string;
      scrape: Record<string, any>;
      opts?: Record<string, any>;
    };
    Reply: Record<string, any>;
  }>(
    "/scrape",
    async (request, reply) => {
      if (request.body.url && request.body.scrape) {
        const scrape = new Scraper(request.body?.opts ?? {})
        const res = await scrape.scrapeIt(request.body)
        reply.send(res ?? ({error: true}));
      } else {
        // Throw error
        throw new Error("Invalid credentials");
      }
    }
  );
};

export default scraperRoute;