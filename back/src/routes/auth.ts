import { FastifyInstance } from "fastify";
import { z } from "zod";
import bcrypt from "bcrypt";
import { supabase } from "../config/supabase";
import { signToken } from "../utils/jwt";
import { authenticate } from "../server";

export async function authRoutes(server: FastifyInstance) {
  server.post("/login", async (request, reply) => {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string()
    });

    try {
      const { email, password } = loginSchema.parse(request.body);

      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !user) {
        return reply.status(401).send({ error: "Credenciais inválidas" });
      }

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return reply.status(401).send({ error: "Credenciais inválidas" });
      }

      const token = signToken({ userId: user.id, role: user.role as "GM" | "PLAYER" });

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: "Dados inválidos", details: err.issues });
      }
      server.log.error(err);
      return reply.status(500).send({ error: "Erro interno do servidor" });
    }
  });

  server.get("/me", { preHandler: [authenticate] }, async (request, reply) => {
    const userId = request.user?.userId;
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return reply.status(404).send({ error: "Usuário não encontrado" });
    }

    return user;
  });
}
