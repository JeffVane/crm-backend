const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// 👉 Listar todas as vendas do usuário logado
router.get('/', async (req, res) => {
  const userId = req.user.userId;

  try {
    const sales = await prisma.sale.findMany({
      where: { userId },
      include: {
        client: true,
      },
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👉 Buscar uma venda específica do usuário
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const sale = await prisma.sale.findFirst({
      where: { id, userId },
      include: {
        client: true,
      },
    });

    if (!sale) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👉 Criar uma venda
router.post('/', async (req, res) => {
  const { clientId, description, value, date } = req.body;
  const userId = req.user.userId;

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

// 👉 Atualizar uma venda
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { description, value, date } = req.body;
  const userId = req.user.userId;

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

// 👉 Deletar uma venda
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

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
