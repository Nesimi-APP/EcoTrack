import { and, desc, eq } from "drizzle-orm";
import { Router } from "express";
import { db, carbonEntriesTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// GET /api/entries — list user's entries
router.get("/entries", requireAuth, async (req, res) => {
  const { userId } = req as AuthRequest;
  const rows = await db
    .select()
    .from(carbonEntriesTable)
    .where(eq(carbonEntriesTable.userId, userId))
    .orderBy(desc(carbonEntriesTable.date));

  return res.json(
    rows.map((r) => ({
      id: r.id,
      transport: r.transport,
      energy: r.energy,
      food: r.food,
      total: r.total,
      date: r.date?.toISOString() ?? new Date().toISOString(),
    }))
  );
});

// POST /api/entries — create entry
router.post("/entries", requireAuth, async (req, res) => {
  const { userId } = req as AuthRequest;
  const { id, transport, energy, food, total, date } = req.body as {
    id?: string;
    transport?: number;
    energy?: number;
    food?: number;
    total?: number;
    date?: string;
  };

  if (!id || total === undefined) {
    return res.status(400).json({ error: "id və total tələb olunur" });
  }

  const entryDate = date ? new Date(date) : new Date();

  await db.insert(carbonEntriesTable).values({
    id,
    userId,
    transport: transport ?? 0,
    energy: energy ?? 0,
    food: food ?? 0,
    total,
    date: entryDate,
  });

  return res.status(201).json({
    id,
    transport: transport ?? 0,
    energy: energy ?? 0,
    food: food ?? 0,
    total,
    date: entryDate.toISOString(),
  });
});

// DELETE /api/entries/:id
router.delete("/entries/:id", requireAuth, async (req, res) => {
  const { userId } = req as AuthRequest;
  const { id } = req.params;

  await db
    .delete(carbonEntriesTable)
    .where(
      and(
        eq(carbonEntriesTable.id, id),
        eq(carbonEntriesTable.userId, userId)
      )
    );

  return res.json({ ok: true });
});

export default router;
