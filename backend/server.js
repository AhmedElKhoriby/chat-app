import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? false
        : ['http://localhost:5500', 'http://127.0.0.1:5500'],
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

httpServer.listen(5500, () => {
  console.log('Socket.IO server is running on port 5500');
});

// -------------------- Note About CORS Here: --------------------

/*
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? false
        : ['http://localhost:5500', 'http://127.0.0.1:5500'],
  }, 
*/

// Enable CORS for development
// This is important to allow the client to connect to the server from a different origin (localhost:5500)
// In production, you might want to restrict this to specific origins
// or set it to false to disable CORS altogether.
// For example, if your client is hosted on a different domain or port,
// you need to specify that domain or port here.
// The `origin` option specifies which origins are allowed to connect to the server.

//==============================================================

// CORS (Cross-Origin Resource Sharing) is a security feature (a middleware) implemented by web browsers to prevent malicious websites from making requests to other domains.
// It allows servers to specify which origins are allowed to access their resources.
// By default, browsers block requests to different origins (domains, protocols, or ports) for security reasons.
// This is particularly important when your client and server are running on different domains or ports during development.
// The cors option in the Socket.IO server configuration is used to enable or configure CORS for WebSocket connections.
