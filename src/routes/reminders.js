const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

/** 🔸 Criar um lembrete */
router.post('/', auth, async (req, res) => {
  const { title, type, description, date, clientId } = req.body;
  try {
    const reminder = await prisma.reminder.create({
      data: {
        type,
        date: new Date(date),
        done: false,
        userId: req.user.id,
        clientId
      }
    });
    res.json(reminder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar lembrete' });
  }
});

/** 🔸 Listar todos os lembretes do usuário */
router.get('/', auth, async (req, res) => {
  try {
    const reminders = await prisma.reminder.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'asc' },
      include: { client: true }
    });
    res.json(reminders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar lembretes' });
  }
});

/** 🔸 Buscar lembrete específico por ID */
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const reminder = await prisma.reminder.findFirst({
      where: { id, userId: req.user.id },
      include: { client: true }
    });
    if (!reminder) {
      return res.status(404).json({ error: 'Lembrete não encontrado' });
    }
    res.json(reminder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar lembrete' });
  }
});

/** 🔸 Atualizar lembrete */
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { type, date, done, clientId } = req.body;
  try {
    const update = await prisma.reminder.updateMany({
      where: { id, userId: req.user.id },
      data: { type, date: new Date(date), done, clientId }
    });
    if (update.count === 0) {
      return res.status(404).json({ error: 'Lembrete não encontrado' });
    }
    res.json({ message: 'Lembrete atualizado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar lembrete' });
  }
});

/** 🔸 Deletar lembrete */
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const del = await prisma.reminder.deleteMany({
      where: { id, userId: req.user.id }
    });
    if (del.count === 0) {
      return res.status(404).json({ error: 'Lembrete não encontrado' });
    }
    res.json({ message: 'Lembrete excluído com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir lembrete' });
  }
});

module.exports = router;
