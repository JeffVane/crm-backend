const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth'); // 🔒 Middleware de autenticação

const prisma = new PrismaClient();
const router = express.Router();

/** 👉 Listar vendas com filtros e paginação */
router.get('/', auth, async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { page = 1, limit = 10, clientId, dateFrom, dateTo } = req.query;
  const skip = (page - 1) * limit;

  try {
    const where = {
      userId,
      ...(clientId && { clientId }),
      ...(dateFrom && dateTo && {
        date: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo),
        },
      }),
    };

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { date: 'desc' },
        include: { client: true },
      }),
      prisma.sale.count({ where }),
    ]);

    res.json({
      data: sales,
      total,
      page: Number(page),
      lastPage: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar vendas' });
  }
});

/** 👉 Buscar venda específica */
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id || req.user.userId;

  try {
    const sale = await prisma.sale.findFirst({
      where: { id, userId },
      include: { client: true },
    });

    if (!sale) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/** 👉 Criar venda */
router.post('/', auth, async (req, res) => {
  const { clientId, description, value, date } = req.body;
  const userId = req.user.id || req.user.userId;

  try {
    const sale = await prisma.sale.create({
      data: {
        clientId,
        userId,
        description,
        value,
        date: new Date(date),
      },
    });
    res.json(sale);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/** 👉 Atualizar venda */
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { description, value, date } = req.body;
  const userId = req.user.id || req.user.userId;

  try {
    const sale = await prisma.sale.updateMany({
      where: { id, userId },
      data: {
        description,
        value,
        date: new Date(date),
      },
    });

    if (sale.count === 0) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    res.json({ message: 'Venda atualizada com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/** 👉 Deletar venda */
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id || req.user.userId;

  try {
    const sale = await prisma.sale.deleteMany({
      where: { id, userId },
    });

    if (sale.count === 0) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    res.json({ message: 'Venda deletada com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
