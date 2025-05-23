const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// 👉 Listar todas as notas do usuário
router.get('/', async (req, res) => {
  const userId = req.user.userId;

  try {
    const notes = await prisma.note.findMany({
      where: { userId },
      include: { client: true },
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👉 Listar notas de um cliente específico
router.get('/client/:clientId', async (req, res) => {
  const { clientId } = req.params;
  const userId = req.user.userId;

  try {
    const notes = await prisma.note.findMany({
      where: { clientId, userId },
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👉 Criar nota
router.post('/', async (req, res) => {
  const { clientId, content } = req.body;
  const userId = req.user.userId;

  try {
    const note = await prisma.note.create({
      data: {
        clientId,
        userId,
        content,
      },
    });
    res.json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 👉 Atualizar nota
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.userId;

  try {
    const note = await prisma.note.updateMany({
      where: { id, userId },
      data: { content },
    });

    if (note.count === 0) {
      return res.status(404).json({ error: 'Nota não encontrada' });
    }

    res.json({ message: 'Nota atualizada com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 👉 Deletar nota
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const note = await prisma.note.deleteMany({
      where: { id, userId },
    });

    if (note.count === 0) {
      return res.status(404).json({ error: 'Nota não encontrada' });
    }

    res.json({ message: 'Nota deletada com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
