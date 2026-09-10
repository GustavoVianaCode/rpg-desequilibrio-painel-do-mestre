import { FastifyInstance } from "fastify";
import { supabase } from "../config/supabase";
import { authenticate, requireGM } from "../server";

export async function dormitoryRoutes(server: FastifyInstance) {
  server.get("/", { preHandler: [authenticate] }, async (request, reply) => {
    const { data, error } = await supabase.from("dormitories").select("*").order("name");
    if (error) return reply.status(500).send({ error: error.message });
    return data || [];
  });

  server.post("/", { preHandler: [requireGM] }, async (request, reply) => {
    const { name, total_slots } = request.body as { name: string; total_slots?: number };
    const { data, error } = await supabase.from("dormitories").insert({ name, total_slots: total_slots ?? 20, occupied_slots: 0 }).select().single();
    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });
}
