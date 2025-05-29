const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

/** 🔸 Criar um lembrete */
router.post('/', auth, async (req, res) => {
  const { type, date, done = false, clientId } = req.body;

  try {
    const reminder = await prisma.reminder.create({
      data: {
        type,
        date: new Date(date),
        done,
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

/** 🔸 Listar todos os lembretes com filtros e paginação */
router.get('/', auth, async (req, res) => {
  const { page = 1, limit = 10, type, done, clientId, dateFrom, dateTo } = req.query;
  const skip = (page - 1) * limit;

  try {
    const where = {
      userId: req.user.id,
      ...(type && { type }),
      ...(clientId && { clientId }),
      ...(done !== undefined && { done: done === 'true' }),
      ...(dateFrom && dateTo && {
        date: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo),
        },
      }),
    };

    const [reminders, total] = await Promise.all([
      prisma.reminder.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { date: 'asc' },
        include: { client: true },
      }),
      prisma.reminder.count({ where }),
    ]);

    res.json({
      data: reminders,
      total,
      page: Number(page),
      lastPage: Math.ceil(total / limit),
    });
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
      data: {
        type,
        date: new Date(date),
        done,
        clientId,
      },
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
      where: { id, userId: req.user.id },
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

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Lista os clientes do usuário logado
 *     tags: [Clients]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página da busca
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filtro de busca pelo nome do cliente
 *     responses:
 *       200:
 *         description: Lista de clientes retornada com sucesso
 */
