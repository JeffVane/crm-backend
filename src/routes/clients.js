const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// 👉 Listar todos os clientes
router.get('/', async (req, res) => {
  const clients = await prisma.client.findMany();
  res.json(clients);
});

// 👉 Buscar cliente por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const client = await prisma.client.findUnique({
    where: { id },
  });
  if (!client) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }
  res.json(client);
});

// 👉 Criar novo cliente
router.post('/', async (req, res) => {
  const { name, phone, email, birthday, notes, userId } = req.body;

  try {
    const client = await prisma.client.create({
      data: {
        name,
        phone,
        email,
        birthday: birthday ? new Date(birthday) : null,
        notes,
        userId,
      },
    });
    res.json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 👉 Atualizar cliente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, birthday, notes } = req.body;

  try {
    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        phone,
        email,
        birthday: birthday ? new Date(birthday) : null,
        notes,
      },
    });
    res.json(client);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar cliente' });
  }
});

// 👉 Deletar cliente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.client.delete({
      where: { id },
    });
    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao deletar cliente' });
  }
});

module.exports = router;
