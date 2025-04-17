import path from 'path';
import { fileURLToPath } from 'url'; // Importing fileURLToPath from url module to get the current file name
// The fileURLToPath function is used to convert a URL string to a file path.
import express from 'express';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url); // Get the current file name
const __dirname = path.dirname(__filename); // Get the current directory name
// __dirname is the directory name of the current module, which is the directory where this file is located.

const PORT = process.env.NODE_ENV || 3000;

const app = express();

app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory

const expressServer = app.listen(PORT, () => {
  console.log(`Socket.IO server is running on port ${PORT}`);
});
const io = new Server(expressServer, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? false
        : [`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`],
  },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('message', (msg) => {
    console.log('Message received:', msg);
    io.emit('broadcast_message', msg); // Broadcast the message to all connected clients
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});
