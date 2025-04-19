// Dependencies
import express from 'express';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url'; // Importing fileURLToPath from url module to get the current file name
// The fileURLToPath function is used to convert a URL string to a file path.

// Setup Paths
const __filename = fileURLToPath(import.meta.url); // Get the current file name
const __dirname = path.dirname(__filename); // Get the current directory name
// __dirname is the directory name of the current module, which is the directory where this file is located.

// Server Config
const PORT = process.env.NODE_ENV || 3000;
const app = express();
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory

// HTTP & WebSocket Server
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

// Socket Events
io.on('connection', (socket) => {
  const name = socket.id.substring(0, 5); // Get the socket ID
  // Handle disconnect
  // Handle typing activity

  // Log the socket ID of the connected user
  console.log('A user connected:', socket.id);

  // Send welcome message to new user
  socket.emit('message', 'Welcome to the Chat App!');

  // Notify (Broadcast) others of new connection
  socket.broadcast.emit('message', `User ${name} connected`);

  // Handle incoming chat messages from the client
  socket.on('message', (message) => {
    const newMessage = `Message from ${name}: ${message}`;
    console.log(newMessage);
    // Broadcast the message to all connected clients
    io.emit('message', newMessage);
  });

  // Handle typing activity
  socket.on('typing', (name) => {
    // Broadcast the typing activity to all connected clients
    socket.broadcast.emit('typing', name);
  });

  // Listen for the disconnect event
  socket.on('disconnect', () => console.log('A user disconnected:', socket.id));
});
