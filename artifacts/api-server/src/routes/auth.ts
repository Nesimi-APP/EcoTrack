import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { signToken } from "../lib/jwt.js";

const router = Router();

// POST /api/auth/register
router.post("/auth/register", async (req, res) => {
  const { email, name, password } = req.body as {
    email?: string;
    name?: string;
    password?: string;
  };

  if (!email || !name || !password) {
    return res.status(400).json({ error: "Bütün sahələr doldurulmalıdır" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Şifrə ən az 8 simvol olmalıdır" });
  }

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()))
    .limit(1);

  if (existing.length > 0) {
    return res.status(409).json({ error: "Bu e-poçt artıq qeydiyyatdadır" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();

  await db.insert(usersTable).values({
    id,
    email: email.toLowerCase(),
    name,
    passwordHash,
  });

  const token = signToken({ userId: id, email: email.toLowerCase() });
  return res.status(201).json({
    token,
    user: { id, name, email: email.toLowerCase() },
  });
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return res.status(400).json({ error: "E-poçt və şifrə tələb olunur" });
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    return res.status(401).json({ error: "E-poçt və ya şifrə yanlışdır" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "E-poçt və ya şifrə yanlışdır" });
  }

  const token = signToken({ userId: user.id, email: user.email });
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

export default router;
