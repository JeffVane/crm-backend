const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

/** 🔥 Endpoint principal do Dashboard */
router.get('/', auth, async (req, res) => {
  const userId = req.user.id || req.user.userId;

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  try {
    const [totalClients, totalSales, totalNotes, totalReminders, salesThisMonth, birthdaysThisMonth] = await Promise.all([
      // Total de Clientes
      prisma.client.count({ where: { userId } }),

      // Total de Vendas
      prisma.sale.count({ where: { userId } }),

      // Total de Notas
      prisma.note.count({ where: { userId } }),

      // Total de Lembretes
      prisma.reminder.count({ where: { userId } }),

      // Faturamento do mês atual
      prisma.sale.aggregate({
        where: {
          userId,
          date: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
        _sum: { value: true },
      }),

      // Aniversariantes do mês
      prisma.client.findMany({
        where: {
          userId,
          birthday: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
            lte: new Date(today.getFullYear(), today.getMonth(), lastDayOfMonth.getDate()),
          },
        },
        select: {
          id: true,
          name: true,
          birthday: true,
        },
      }),
    ]);

    res.json({
      totalClients,
      totalSales,
      totalNotes,
      totalReminders,
      salesThisMonth: salesThisMonth._sum.value || 0,
      birthdaysThisMonth,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar dashboard' });
  }
});

module.exports = router;
