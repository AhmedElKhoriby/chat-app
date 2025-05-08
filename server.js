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
const ADMIN = 'Admin';
const app = express();
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory

// HTTP ,WebSocket Server & User State
const expressServer = app.listen(PORT, () => {
  console.log(`Socket.IO server is running on port ${PORT}`);
});

const UsersState = {
  users: [], // Array to store connected users
  setUsers: function (newUsersArray) {
    this.users = newUsersArray; // Update the users array with the new array
  },
};

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
  // Log the socket ID of the connected user
  console.log('A user connected:', socket.id);
  // Send welcome message to new user
  socket.emit('message', buildMsg(ADMIN, 'Welcome to the chat!')); // Send a welcome message to the new user

  socket.on('enterRoom', ({ name, room }) => {
    // Leave the previous room if any
    const prevRoom = getUser(socket.id)?.room; // Get the previous room of the user

    if (prevRoom) {
      // Leave the previous room
      socket.leave(prevRoom);
      // Notify others in the previous room that the user has left
      io.to(prevRoom).emit(
        'message',
        buildMsg(ADMIN, `${name} has left the room`)
      );
    }
    // Activate the user in the new room
    const user = activateUser(socket.id, name, room);

    //! cannot update previous room users until after the state update in activate user
    if (prevRoom) {
      const prevRoomUsers = getUsersInRoom(prevRoom); // Get users in the previous room
      io.to(prevRoom).emit('userList', { users: prevRoomUsers }); // Send updated user list to the previous room
    }

    // Join the new room
    socket.join(user.room);
    // Send a welcome message to the new room
    socket.emit('message', buildMsg(ADMIN, `Welcome to ${room} room!`));

    // Notify others in the new room that the user has joined
    socket.broadcast
      .to(user.room)
      .emit('message', buildMsg(ADMIN, `${name} has joined the room`));

    // Send the updated user list to the new room
    io.to(user.room).emit('userList', { users: getUsersInRoom(room) }); // Send updated user list to the

    // Send the updated room list to all users
    io.emit('roomList', { rooms: getAllActiveRooms() }); // Send updated room list to all users
  });

  socket.on('disconnect', () => {
    const user = getUser(socket.id); // Get the user who disconnected

    userLeavesApp(socket.id); // Remove the user from the state

    if (user) {
      // Notify others in the room that the user has left
      io.to(user.room).emit(
        'message',
        buildMsg(ADMIN, `${user.name} has left the room`)
      );
      // Send the updated user list to the room
      io.to(user.room).emit('userList', { users: getUsersInRoom(user.room) }); // Send updated user list to the room

      console.log('A user disconnected:', user);
    }
  });

  // Handle incoming chat messages from the client
  socket.on('message', ({ name, text }) => {
    const room = getUser(socket.id)?.room; // Get the room of the user
    if (!room) return; // If no room, do nothing

    io.to(room).emit('message', buildMsg(name, text)); // Send the message to the room

    console.log(`Message from ${name} in ${room}: ${text}`); // Log the message
  });

  // Handle typing activity
  socket.on('typing', (name) => {
    const room = getUser(socket.id)?.room; // Get the room of the user
    if (!room) return; // If no room, do nothing

    // Broadcast the typing activity to all connected clients
    socket.broadcast.to(room).emit('typing', name);
  });
});

// create a message object
function buildMsg(name, text) {
  return {
    name,
    text,
    time: new Intl.DateTimeFormat('default', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }).format(new Date()),
  };
}

// User Functions
function activateUser(id, name, room) {
  const user = { id, name, room };
  UsersState.setUsers([
    ...UsersState.users.filter((user) => user.id !== id), // Filter out the user with the same ID
    user, // Add the new user to the array
  ]);
  return user; // Return the user object
}

function userLeavesApp(id) {
  const user = UsersState.users.find((user) => user.id === id); // Find the user with the given ID

  if (!user) return null; // Return null if no user is found

  UsersState.setUsers([
    ...UsersState.users.filter((user) => user.id !== id), // Filter out the user with the same ID
  ]); // Update the users array by removing the user
  return user; // Return the user object
}

function getUser(id) {
  return UsersState.users.find((user) => user.id === id); // Find and return the user with the given ID
}

function getUsersInRoom(room) {
  return UsersState.users.filter((user) => user.room === room); // Filter and return users in the specified room
}

function getAllActiveRooms() {
  return [...new Set(UsersState.users.map((user) => user.room))];
}
