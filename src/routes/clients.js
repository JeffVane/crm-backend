const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth'); // 🔒 Middleware de autenticação (caso use)

const prisma = new PrismaClient();
const router = express.Router();

/** 👉 Listar todos os clientes com filtros e paginação */
router.get('/', auth, async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const skip = (page - 1) * limit;

  try {
    const where = {
      userId: req.user.id, // 🔒 Pega apenas os clientes do usuário autenticado
      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      }),
    };

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { created_at: 'desc' },
      }),
      prisma.client.count({ where }),
    ]);

    res.json({
      data: clients,
      total,
      page: Number(page),
      lastPage: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

/** 👉 Buscar cliente por ID */
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;

  const client = await prisma.client.findFirst({
    where: {
      id,
      userId: req.user.id, // 🔒 Garante que o cliente pertence ao usuário logado
    },
  });

  if (!client) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  res.json(client);
});

/** 👉 Criar novo cliente */
router.post('/', auth, async (req, res) => {
  const { name, phone, email, birthday, notes } = req.body;

  try {
    const client = await prisma.client.create({
      data: {
        name,
        phone,
        email,
        birthday: birthday ? new Date(birthday) : null,
        notes,
        userId: req.user.id, // 🔒 Cliente vinculado ao usuário logado
      },
    });
    res.json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/** 👉 Atualizar cliente */
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, birthday, notes } = req.body;

  try {
    const client = await prisma.client.updateMany({
      where: {
        id,
        userId: req.user.id, // 🔒 Só atualiza se for do usuário logado
      },
      data: {
        name,
        phone,
        email,
        birthday: birthday ? new Date(birthday) : null,
        notes,
      },
    });

    if (client.count === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ message: 'Cliente atualizado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar cliente' });
  }
});

/** 👉 Deletar cliente */
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const client = await prisma.client.deleteMany({
      where: {
        id,
        userId: req.user.id, // 🔒 Só deleta se for do usuário logado
      },
    });

    if (client.count === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao deletar cliente' });
  }
});

module.exports = router;

