import { FastifyInstance } from "fastify";
import { z } from "zod";
import { supabase } from "../config/supabase";
import { requireGM } from "../server";

export async function relationshipRoutes(server: FastifyInstance) {
  server.patch("/:player_id/:npc_id", { preHandler: [requireGM] }, async (request, reply) => {
    const updateSchema = z.object({
      level: z.number().min(-4).max(4)
    });

    try {
      const { level } = updateSchema.parse(request.body);
      const { player_id, npc_id } = request.params as { player_id: string; npc_id: string };

      const { data, error } = await supabase
        .from("relationships")
        .update({ level })
        .eq("player_id", player_id)
        .eq("npc_id", npc_id)
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        player: data.player_id,
        npc: data.npc_id,
        level: data.level
      };
    } catch (err) {
      if (err instanceof z.ZodError) return reply.status(400).send({ error: "Dados inválidos", details: err.issues });
      server.log.error(err);
      return reply.status(500).send({ error: "Erro ao atualizar relacionamento" });
    }
  });
}
