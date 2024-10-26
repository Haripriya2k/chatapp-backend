// client.js

const socket = io();
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const nameInput = document.getElementById('name-input');
const messageContainer = document.getElementById('message-container');

// Handle form submission
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const message = messageInput.value.trim();
  const username = nameInput.value.trim() || 'anonymous';

  if (message === '') return; // Prevent sending empty messages

  // Send the message with the username to the server
  socket.emit('message', { username, message });

  appendMessageToContainer('message-right', { username, message });

  messageInput.value = '';
});

// Listen for incoming chat messages
socket.on('chat-message', (data) => {
  appendMessageToContainer('message-left', data);
});

// Listen for total connected clients
socket.on('clients-total', (count) => {
  const clientsIndicator = document.getElementById('clients-indicator');
  if (clientsIndicator) {
    clientsIndicator.textContent = `Connected Clients: ${count}`;
  }
});

// Function to append messages to the container
function appendMessageToContainer(messageClass, data) {
  const li = document.createElement('li');
  li.classList.add(messageClass);

  const p = document.createElement('p');
  p.innerHTML = `${sanitize(data.message)}<span>${sanitize(data.username)} ● ${new Date(data.timestamp).toLocaleString()}</span>`;
  li.appendChild(p);

  messageContainer.appendChild(li);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Function to sanitize inputs to prevent XSS
function sanitize(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}
