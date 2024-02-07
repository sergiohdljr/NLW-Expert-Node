import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";

export async function getPoll(app: FastifyInstance) {
  app.get(
    "/polls/:poll_id",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const getPoll = z.object({
        poll_id: z.string().uuid(),
      });

      const { poll_id } = getPoll.parse(request.params);

      const polls = await prisma.polls.findUnique({
        where: {
          id: poll_id,
        },
        include: {
          options: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      return reply.send({ polls });
    }
  );
}
