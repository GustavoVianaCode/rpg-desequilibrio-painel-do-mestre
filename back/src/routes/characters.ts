import { FastifyInstance } from "fastify";
import { z } from "zod";
import { supabase } from "../config/supabase";
import { authenticate, requireGM } from "../server";

export async function characterRoutes(server: FastifyInstance) {
  // Apenas GM pode criar personagens
  server.post("/", { preHandler: [requireGM] }, async (request, reply) => {
    const characterSchema = z.object({
      character_type: z.enum(["PLAYER", "NPC"]),
      name: z.string(),
      initials: z.string(),
      dormitory: z.string().default("—"),
      image_url: z.string().optional(),
      player_id: z.string().uuid().optional(),
      familiar_id: z.string().default("none"),
      npc_type: z.string().optional(),
      role_subject_ids: z.array(z.string()).default([]),
    });

    try {
      const { role_subject_ids, ...charData } = characterSchema.parse(request.body);

      // Inserir personagem
      const { data: char, error } = await supabase
        .from("characters")
        .insert(charData)
        .select()
        .single();

      if (error || !char) throw error;

      // Inserir matérias (roles)
      if (role_subject_ids.length > 0) {
        const charSubjects = role_subject_ids.map((subId) => ({
          character_id: char.id,
          subject_id: subId
        }));
        await supabase.from("character_subjects").insert(charSubjects);
      }

      // Regra de Amizade Automática (NxM)
      // Se criei um PLAYER, devo criar relação com TODOS OS NPCs existentes
      // Se criei um NPC, devo criar relação com TODOS OS PLAYERs existentes
      const oppositeType = char.character_type === "PLAYER" ? "NPC" : "PLAYER";
      const { data: opposites } = await supabase
        .from("characters")
        .select("id")
        .eq("character_type", oppositeType);

      if (opposites && opposites.length > 0) {
        const relationships = opposites.map((opp) => ({
          player_id: char.character_type === "PLAYER" ? char.id : opp.id,
          npc_id: char.character_type === "NPC" ? char.id : opp.id,
          level: 0
        }));
        await supabase.from("relationships").insert(relationships);
      }

      return reply.status(201).send(char);
    } catch (err) {
      if (err instanceof z.ZodError) return reply.status(400).send({ error: "Dados inválidos", details: err.issues });
      server.log.error(err);
      return reply.status(500).send({ error: "Erro ao criar personagem" });
    }
  });

  // Atualização de pontos, strikes, marcas (Apenas GM)
  server.patch("/:id", { preHandler: [requireGM] }, async (request, reply) => {
    const updateSchema = z.object({
      points: z.number().optional(),
      strikes: z.number().min(0).max(4).optional(),
      has_earned_mark: z.boolean().optional(),
      familiar_id: z.string().optional(),
    });

    try {
      const updates = updateSchema.parse(request.body);
      const { id } = request.params as { id: string };

      // Buscar atual para regras de negócio (strike automático se points cruzar pra <=0)
      const { data: current } = await supabase.from("characters").select("points, strikes").eq("id", id).single();
      
      if (current && updates.points !== undefined) {
        if (current.points > 0 && updates.points <= 0) {
          updates.strikes = Math.min((current.strikes || 0) + 1, 4);
        }
      }

      const { data, error } = await supabase
        .from("characters")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      if (err instanceof z.ZodError) return reply.status(400).send({ error: "Dados inválidos", details: err.issues });
      server.log.error(err);
      return reply.status(500).send({ error: "Erro ao atualizar personagem" });
    }
  });
}
