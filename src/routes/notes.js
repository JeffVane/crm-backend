const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth'); // 🔒 Middleware de autenticação

const prisma = new PrismaClient();
const router = express.Router();

/** 👉 Listar todas as notas com filtros e paginação */
router.get('/', auth, async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { page = 1, limit = 10, clientId, search } = req.query;
  const skip = (page - 1) * limit;

  try {
    const where = {
      userId,
      ...(clientId && { clientId }),
      ...(search && {
        content: {
          contains: search,
          mode: 'insensitive',
        },
      }),
    };

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: { client: true },
      }),
      prisma.note.count({ where }),
    ]);

    res.json({
      data: notes,
      total,
      page: Number(page),
      lastPage: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar notas' });
  }
});

/** 👉 Buscar notas de um cliente específico (rota facilitadora) */
router.get('/client/:clientId', auth, async (req, res) => {
  const { clientId } = req.params;
  const userId = req.user.id || req.user.userId;

  try {
    const notes = await prisma.note.findMany({
      where: { clientId, userId },
      orderBy: { created_at: 'desc' },
    });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/** 👉 Criar nota */
router.post('/', auth, async (req, res) => {
  const { clientId, content } = req.body;
  const userId = req.user.id || req.user.userId;

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

/** 👉 Atualizar nota */
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id || req.user.userId;

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

/** 👉 Deletar nota */
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id || req.user.userId;

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
