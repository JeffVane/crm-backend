const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const router = express.Router();

const SECRET = process.env.JWT_SECRET || 'secretoforte'; // 🔥 Recomendo guardar no .env

// 🔐 Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(400).json({ error: 'Usuário não encontrado' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    return res.status(400).json({ error: 'Senha incorreta' });
  }

  const token = jwt.sign(
    { userId: user.id, name: user.name, email: user.email },
    SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
}); // 👈 ESSA CHAVE ESTAVA FALTANDO

// 🔐 Cadastro
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Verificar se já existe usuário com esse e-mail
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({ error: 'E-mail já cadastrado' });
  }

  // Gerar hash da senha
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  // Criar usuário
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password_hash: hashedPassword,
    },
  });

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
  });
});

// ✅ Exportar no final
module.exports = router;
