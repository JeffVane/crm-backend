require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../docs/swagger');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Importar middleware de autenticação
const authenticateToken = require('./middleware/auth');

// Importar rotas
const clientsRouter = require('./routes/clients');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const notesRouter = require('./routes/notes');
app.use('/notes', authenticateToken, notesRouter);

const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);


const reminderRoutes = require('./routes/reminders');
app.use('/api/reminders', reminderRoutes);



const salesRouter = require('./routes/sales');
app.use('/sales', authenticateToken, salesRouter);


// Rotas públicas
app.use('/users', usersRouter);
app.use('/auth', authRouter);

// Rotas protegidas (com token JWT)
app.use('/clients', authenticateToken, clientsRouter);

// Teste — Rota raiz
app.get('/', (req, res) => {
  res.send('🚀 API CRM está rodando!');
});

// Subir o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

