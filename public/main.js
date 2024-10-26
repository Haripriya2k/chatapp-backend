const socket = io();
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const nameInput = document.getElementById('name-input');
const messageContainer = document.getElementById('message-container');

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const message = messageInput.value;
  const username = nameInput.value || 'anonymous';

  // Send the message with the username to the server
  socket.emit('message', {
    username: username,
    message: message,
  });

  appendMessageToContainer('message-right', { message, username });

  messageInput.value = '';
});

function appendMessageToContainer(messageClass, data) {
  const li = document.createElement('li');
  li.classList.add(messageClass);

  const p = document.createElement('p');
  p.innerHTML = `${data.message}<span>${data.username} ● ${new Date().toLocaleString()}</span>`;
  li.appendChild(p);

  messageContainer.appendChild(li);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}
