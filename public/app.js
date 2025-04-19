// Socket.IO Client
const socket = io('ws://localhost:3000');

// Elements
const activityDisplay = document.querySelector('.activity'); // Get the activity element
const messageInput = document.querySelector('input'); // Get the input field
const messageForm = document.querySelector('form'); // Get the form element
const messageList = document.getElementById('ul'); // Get the messages container

// Send message to server
function handleSendMessage(e) {
  e.preventDefault(); // Prevent the default form submission behavior

  const message = messageInput.value.trim();
  if (!message) return; // Prevent sending empty messages

  socket.emit('message', message);
  messageInput.value = '';
  messageInput.focus();
}

// Handle received messages from the server (display them in the UI)
function handleIncomingMessage(data) {
  activityDisplay.textContent = ''; // Clear the activity display

  const newMsg = document.createElement('li'); // Create a new list item for the message
  newMsg.textContent = data; // Set the text content of the new message
  messages.appendChild(newMsg); // Append the new message to the messages container
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
  const name = socket.id.substring(0, 5); // Get the socket ID
  socket.emit('typing', name); // Emit the typing event with the socket ID
}

// ====== Event Listeners ======
messageForm.addEventListener('submit', handleSendMessage); // Add event listener to the form submission
messageInput.addEventListener('keypress', handleKeyPress); // Add event listener to the input field for keypress

socket.on('typing', handleTypingActivity); // Listen for typing activity from the server
socket.on('message', handleIncomingMessage); // Listen for incoming messages from the server
socket.on('connect', () => console.log('Connected to server!')); // Log connection status
socket.on('disconnect', () => console.log('Disconnected from server!')); // Log disconnection status
socket.on('connect_error', (err) => console.log('Connection error:', err)); // Log connection errors
