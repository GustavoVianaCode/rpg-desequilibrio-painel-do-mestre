import { FastifyInstance } from "fastify";
import { supabase } from "../config/supabase";
import { authenticate } from "../server";

export async function sessionRoutes(server: FastifyInstance) {
  server.get("/", { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const [familiarsRes, subjectsRes, charactersRes, relationshipsRes] = await Promise.all([
        supabase.from("familiars").select("*"),
        supabase.from("subjects").select("*"),
        supabase.from("characters").select(`
          *,
          character_subjects (
            subject_id
          )
        `),
        supabase.from("relationships").select("*")
      ]);

      if (familiarsRes.error) throw familiarsRes.error;
      if (subjectsRes.error) throw subjectsRes.error;
      if (charactersRes.error) throw charactersRes.error;
      if (relationshipsRes.error) throw relationshipsRes.error;

      const subjects = subjectsRes.data || [];
      const familiars = familiarsRes.data || [];

      const formatCharacter = (char: any) => {
        const charSubjects = char.character_subjects
          .map((cs: any) => subjects.find((s) => s.id === cs.subject_id))
          .filter(Boolean);

        return {
          id: char.id,
          name: char.name,
          initials: char.initials,
          points: char.points,
          strikes: char.strikes,
          dormitory: char.dormitory,
          imageUrl: char.image_url,
          hasEarnedMark: char.has_earned_mark,
          familiarId: char.familiar_id,
          role: charSubjects,
          ...(char.character_type === "PLAYER"
            ? { playerId: char.player_id }
            : { type: char.npc_type }),
        };
      };

      const players = (charactersRes.data || [])
        .filter((c) => c.character_type === "PLAYER")
        .map(formatCharacter);

      const npcs = (charactersRes.data || [])
        .filter((c) => c.character_type === "NPC")
        .map(formatCharacter);

      const relationships = (relationshipsRes.data || []).map((r) => ({
        id: r.id,
        player: r.player_id,
        npc: r.npc_id,
        level: r.level,
      }));

      return {
        familiars,
        subjects,
        players,
        npcs,
        relationships,
      };
    } catch (err) {
      server.log.error(err);
      return reply.status(500).send({ error: "Erro interno do servidor" });
    }
  });
}
