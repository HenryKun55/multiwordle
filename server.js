const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Inicializar Socket.io apenas no servidor
  if (!dev || process.env.INIT_SOCKET !== 'false') {
    try {
      const { initializeSocket } = require('./server/socket-server.js');
      initializeSocket(httpServer);
      console.log('Socket.io inicializado com sucesso');
    } catch (err) {
      console.error('Erro ao inicializar Socket.io:', err);
    }
  }

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Servidor rodando em http://${hostname}:${port}`);
    });
});
