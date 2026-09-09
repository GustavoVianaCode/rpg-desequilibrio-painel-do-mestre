import { FastifyInstance } from "fastify";
import { z } from "zod";
import bcrypt from "bcrypt";
import { supabase } from "../config/supabase";
import { requireGM } from "../server";

export async function adminRoutes(server: FastifyInstance) {
  server.addHook("preHandler", requireGM); // Restrito para GM

  server.get("/users", async (request, reply) => {
    const { data, error } = await supabase.from("users").select("id, name, email, role, created_at");
    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  server.post("/users", async (request, reply) => {
    const userSchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(["GM", "PLAYER"]).default("PLAYER")
    });

    try {
      const { name, email, password, role } = userSchema.parse(request.body);
      const password_hash = await bcrypt.hash(password, 10);

      const { data, error } = await supabase
        .from("users")
        .insert({ name, email, password_hash, role })
        .select("id, name, email, role")
        .single();

      if (error) throw error;
      return reply.status(201).send(data);
    } catch (err) {
      if (err instanceof z.ZodError) return reply.status(400).send({ error: "Dados inválidos", details: err.issues });
      return reply.status(500).send({ error: "Erro ao criar usuário" });
    }
  });

  server.post("/familiars", async (request, reply) => {
    const familiarSchema = z.object({
      id: z.string(),
      name: z.string(),
      image_url: z.string().optional()
    });

    try {
      const { id, name, image_url } = familiarSchema.parse(request.body);
      const { data, error } = await supabase
        .from("familiars")
        .insert({ id, name, image_url })
        .select()
        .single();

      if (error) throw error;
      return reply.status(201).send(data);
    } catch (err) {
      if (err instanceof z.ZodError) return reply.status(400).send({ error: "Dados inválidos", details: err.issues });
      return reply.status(500).send({ error: "Erro ao criar familiar" });
    }
  });
}
