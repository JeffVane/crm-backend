const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// 👉 Listar todas as vendas
router.get('/', async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        client: true,
        user: true,
      },
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👉 Buscar uma venda específica
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        client: true,
        user: true,
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
  const { clientId, userId, description, value, date } = req.body;

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

  try {
    const sale = await prisma.sale.update({
      where: { id },
      data: {
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

// 👉 Deletar uma venda
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.sale.delete({
      where: { id },
    });
    res.json({ message: 'Venda deletada com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
