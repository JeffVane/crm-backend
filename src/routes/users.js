const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const router = express.Router();

// 🔐 Criar usuário com senha criptografada
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 👉 Listar usuários (opcional)
router.get('/', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

module.exports = router;
