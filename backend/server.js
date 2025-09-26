import http from 'node:http';
import app from './app.js';

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`ARMStatues backend running on port ${PORT}`);
});

export default server;
