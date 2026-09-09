import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { env } from "./config/env";
import { verifyToken, JwtPayload } from "./utils/jwt";
import { authRoutes } from "./routes/auth";
import { sessionRoutes } from "./routes/session";
import { adminRoutes } from "./routes/admin";
import { characterRoutes } from "./routes/characters";
import { relationshipRoutes } from "./routes/relationships";
import { uploadRoutes } from "./routes/upload";

// Extender a tipagem do FastifyRequest para incluir o user
declare module "fastify" {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export const server: FastifyInstance = Fastify({
  logger: true,
});

server.register(cors, {
  origin: "*", // Permitir de qualquer lugar na fase de dev
});

server.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware de autenticação básico
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    request.user = decoded;
  } catch (err) {
    return reply.status(401).send({ error: "Invalid token" });
  }
}

export async function requireGM(request: FastifyRequest, reply: FastifyReply) {
  await authenticate(request, reply);
  if (request.user?.role !== "GM") {
    return reply.status(403).send({ error: "Requires GM role" });
  }
}

// Registro de Rotas
server.register(authRoutes, { prefix: "/auth" });
server.register(sessionRoutes, { prefix: "/session" });
server.register(adminRoutes, { prefix: "/admin" });
server.register(characterRoutes, { prefix: "/characters" });
server.register(relationshipRoutes, { prefix: "/relationships" });
server.register(uploadRoutes, { prefix: "/upload" });

// Rota de Healthcheck
server.get("/health", async () => {
  return { status: "ok" };
});

const start = async () => {
  try {
    await server.listen({ port: env.PORT, host: "0.0.0.0" });
    console.log(`🚀 Server listening on port ${env.PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
