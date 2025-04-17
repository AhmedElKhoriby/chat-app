const socket = io('ws://localhost:5500');

function sendMsg(e) {
  /**
   * e.preventDefault(): Prevent the default form submission behavior
   * This method is used to prevent the default action of the event from being triggered.
   * In this case, it prevents the form from being submitted and the page from reloading when the user presses Enter in the input field.
   * This is important because we want to handle the message sending with Socket.IO instead of the default form submission.
   */
  e.preventDefault(); // Prevent the default form submission behavior
  const msgInput = document.querySelector('input'); // Get the input field
  const msg = msgInput.value; // Get the message from the input field
  if (!msg) return; // Prevent sending empty messages
  socket.emit('message', msg); // Send the message to the server
  msgInput.value = ''; // Clear the input field after sending
  msgInput.focus(); // Focus back on the input field
}

document.querySelector('form').addEventListener('submit', sendMsg); // Add event listener to the form submission

socket.on('connect', () => {
  console.log('Connected to server!');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server!');
});

// Listen for incoming messages from the server
socket.on('broadcast_message', (msg) => {
  const messages = document.getElementById('messages'); // Get the messages container
  const newMsg = document.createElement('li'); // Create a new list item for the message
  newMsg.textContent = msg; // Set the text content of the new message
  messages.appendChild(newMsg); // Append the new message to the messages container
});
