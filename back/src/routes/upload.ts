import { FastifyInstance } from "fastify";
import { supabase } from "../config/supabase";
import { requireGM } from "../server";
import { randomUUID } from "crypto";

export async function uploadRoutes(server: FastifyInstance) {
  server.post("/avatar", { preHandler: [requireGM] }, async (request, reply) => {
    const data = await request.file();
    
    if (!data) {
      return reply.status(400).send({ error: "Nenhum arquivo enviado" });
    }

    try {
      const ext = data.filename.split('.').pop() || "png";
      const filename = `${randomUUID()}.${ext}`;
      
      const fileBuffer = await data.toBuffer();

      const { data: uploadData, error } = await supabase.storage
        .from("avatars")
        .upload(filename, fileBuffer, {
          contentType: data.mimetype,
          upsert: false
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(uploadData.path);

      return reply.status(201).send({ url: publicUrlData.publicUrl });
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({ error: "Erro ao fazer upload da imagem" });
    }
  });
}
