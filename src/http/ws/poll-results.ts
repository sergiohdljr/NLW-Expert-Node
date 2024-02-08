import { FastifyInstance } from "fastify";
import z from "zod";
import { voting } from "../../lib/utils/voting-pub-sub";

export async function pollResult(app: FastifyInstance) {
  app.get(
    "/polls/:poll_id/results",
    { websocket: true },
    (connection, request) => {
      connection.socket.on("message", (message: string) => {
        const getPollParams = z.object({
          pollsId: z.string().uuid(),
        });

        const { pollsId } = getPollParams.parse(request.params);

        voting.subscribe(pollsId, (message) => {
          connection.socket.send(JSON.stringify(message));
        });
      });
    }
  );
}
