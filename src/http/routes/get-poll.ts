import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { redis } from "../../lib/redis";

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

      if (!polls) {
        return reply.status(400).send({ message: "poll not found" });
      }

      const result = await redis.zrange(polls.id, 0, -1, "WITHSCORES");

      const votes = result.reduce((obj, line, index) => {
        if (index % 2 === 0) {
          const score = result[index + 1];

          Object.assign(obj, {
            [line]: Number(score),
          });
        }
        return obj;
      }, {} as Record<string, number>);

      return reply.send({
        poll: {
          id: polls.id,
          title: polls.title,
          options: polls.options.map((option) => {
            return {
              id: option.id,
              title: option.title,
              score: option.id in votes ? votes[option.id] : 0,
            };
          }),
        },
      });
    }
  );
}
