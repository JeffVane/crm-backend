const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API CRM Backend',
      version: '1.0.0',
      description: 'Documentação da API do seu CRM',
    },
    servers: [
      {
        url: 'http://localhost:3000', // ✅ Troca pela URL do Render quando publicar
        description: 'Servidor Local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // 🧠 Caminho onde estão suas rotas
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
