import { Router } from "express";
import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/leaderboard", requireAuth, async (req, res) => {
  const { userId } = req as AuthRequest;

  const rows = await db.execute(sql`
    SELECT
      u.id,
      u.name,
      COALESCE(SUM(e.total), 0)::float AS total_co2,
      COUNT(e.id)::int AS entry_count
    FROM users u
    LEFT JOIN carbon_entries e ON e.user_id = u.id
    GROUP BY u.id, u.name
    ORDER BY total_co2 ASC
    LIMIT 50
  `);

  const list = (rows.rows as Array<{
    id: string;
    name: string;
    total_co2: number;
    entry_count: number;
  }>).map((r, i) => ({
    rank: i + 1,
    name: r.name,
    totalCO2: Number(r.total_co2),
    entryCount: Number(r.entry_count),
    isMe: r.id === userId,
  }));

  return res.json(list);
});

export default router;
