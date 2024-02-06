import fastify, { FastifyRequest, FastifyReply } from "fastify";
import z, { string } from "zod";
import { PrismaClient } from "@prisma/client";

const app = fastify();

const prisma = new PrismaClient();

app.post("/polls", async (request: FastifyRequest, reply: FastifyReply) => {
  const createPollBody = z.object({
    title: z.string(),
  });

  const { title } = createPollBody.parse(request.body);

  const poll = await prisma.polls.create({
    data: {
      title,
    },
  });

  return reply.status(201).send({ poll_id: poll.id });
});

app.listen({ port: 3333 }).then(() => {
  console.log("http server running");
});
