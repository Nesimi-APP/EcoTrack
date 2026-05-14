import { eq } from "drizzle-orm";
import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// GET /api/me — authenticated user profile
router.get("/me", requireAuth, async (req, res) => {
  const { userId } = req as AuthRequest;

  const [user] = await db
    .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, createdAt: usersTable.createdAt })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) {
    return res.status(404).json({ error: "İstifadəçi tapılmadı" });
  }

  return res.json(user);
});

export default router;
