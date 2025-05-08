// Socket.IO Client
const socket = io('ws://localhost:3000');

// Elements
const nameInput = document.querySelector('#name');
const chatRoom = document.querySelector('#room');
const messageInput = document.querySelector('#message');
const messageForm = document.querySelector('.form-msg');
const joinForm = document.querySelector('.form-join');
const chatDisplay = document.querySelector('.chat-display');
const activityDisplay = document.querySelector('.activity');
const usersList = document.querySelector('.user-list');
const roomList = document.querySelector('.room-list');

// Send message to server
function handleSendMessage(e) {
  e.preventDefault(); // Prevent the default form submission behavior

  const message = messageInput.value.trim();
  const name = nameInput.value;
  if (!message.trim() || !name.trim() || !chatRoom.value.trim()) return;

  socket.emit('message', {
    name,
    text: message,
  });
  messageInput.value = '';
  messageInput.focus();
}

function enterRoom(e) {
  e.preventDefault();
  const room = chatRoom.value;
  const name = nameInput.value;
  if (!name || !room) return;

  socket.emit('enterRoom', { name, room });
}

// Handle received messages from the server (display them in the UI)
function handleIncomingMessage(data) {
  activityDisplay.textContent = ''; // Clear the activity display

  const { name, text, time } = data;
  const newMsg = document.createElement('li'); // Create a new list item for the message

  newMsg.className = 'post'; // Set the default class for the message (like Admin)
  if (name === nameInput.value) newMsg.className = 'post post--left'; // Set the class for the user's own message
  if (name !== nameInput.value && name !== 'Admin')
    // Set the class for other users' messages
    newMsg.className = 'post post--right';
  if (name !== 'Admin') {
    // If the message is not from Admin, show the name and time
    newMsg.innerHTML = `<div class="post__header ${
      name === nameInput.value ? 'post__header--user' : 'post__header--reply'
    }">
      <span class="post__header--name">${name}</span> 
      <span class="post__header--time">${time}</span> 
      </div>
      <div class="post__text">${text}</div>`;
  } else {
    // If the message is from Admin, show only the time
    newMsg.innerHTML = `<div class="post__text">${text}</div>`;
  }

  chatDisplay.appendChild(newMsg); // Append the new message to the messages container
  chatDisplay.scrollTop = chatDisplay.scrollHeight; // Scroll to the bottom of the chat display
}

// Handle typing activity display
let typingTimeout; // Variable to store the timeout ID
function handleTypingActivity(name) {
  activityDisplay.textContent = `${name} is typing...`; // Display typing activity

  clearTimeout(typingTimeout); // Clear any existing timeout
  typingTimeout = setTimeout(() => {
    activityDisplay.textContent = ''; // Clear the activity display after a timeout
  }, 2000);
}

// Emit typing activity
function handleKeyPress() {
  const name = nameInput.value; // Get the name from the input field
  socket.emit('typing', name); // Emit the typing event with the name
}

// Show users and rooms in the UI
function showUsers(users) {
  usersList.textContent = '';
  if (users) {
    usersList.innerHTML = `<em>Users in ${chatRoom.value}:</em>`;
    users.forEach((user, i) => {
      usersList.textContent += ` ${user.name}`;
      if (users.length > 1 && i !== users.length - 1) {
        usersList.textContent += ',';
      }
    });
  }
}

// Show active rooms in the UI
function showRooms(rooms) {
  roomList.textContent = '';
  if (rooms) {
    roomList.innerHTML = '<em>Active Rooms:</em>';
    rooms.forEach((room, i) => {
      roomList.textContent += ` ${room}`;
      if (rooms.length > 1 && i !== rooms.length - 1) {
        roomList.textContent += ',';
      }
    });
  }
}

// ====== Event Listeners ======
joinForm.addEventListener('submit', enterRoom); // Add event listener to the join form submission
messageForm.addEventListener('submit', handleSendMessage); // Add event listener to the form submission
messageInput.addEventListener('keypress', handleKeyPress); // Add event listener to the input field for keypress

socket.on('connect', () => console.log('Connected to server!')); // Log connection status
socket.on('message', handleIncomingMessage); // Listen for incoming messages from the server
socket.on('typing', handleTypingActivity); // Listen for typing activity from the server
socket.on('userList', ({ users }) => showUsers(users)); // Listen for user list updates from the server
socket.on('roomList', ({ rooms }) => showRooms(rooms)); // Listen for room list updates from the server
socket.on('disconnect', () => console.log('Disconnected from server!')); // Log disconnection status
socket.on('connect_error', (err) => console.log('Connection error:', err)); // Log connection errors
