// server.js

const express = require('express');
const path = require('path');
const mongoose = require('mongoose'); // Import mongoose
const http = require('http');
const { Server } = require('socket.io'); // Destructure Server from socket.io

const app = express();
const PORT = process.env.PORT || 4000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define a schema for storing chat messages
const messageSchema = new mongoose.Schema({
  username: { type: String, default: 'anonymous' },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Create a model from the schema
const Message = mongoose.model('Message', messageSchema);

// MongoDB connection URI
const MONGODB_URI = 'mongodb://localhost:27017/task'; // Use 127.0.0.1 instead of localhost

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');

  // Create HTTP server and integrate with Socket.io after DB connection
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*', // Adjust as needed for security
      methods: ['GET', 'POST']
    }
  });

  let socketsConnected = new Set();

  // Handle Socket.io connections
  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);
    socketsConnected.add(socket.id);
    io.emit('clients-total', socketsConnected.size);

    // Optionally, send existing messages to the newly connected client
    // Message.find().sort({ timestamp: 1 }).limit(100).then((messages) => {
    //   socket.emit('previous-messages', messages);
    // });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
      socketsConnected.delete(socket.id);
      io.emit('clients-total', socketsConnected.size);
    });

    socket.on('message', async (data) => {
      console.log('💬 Message received:', data);

      // Validate incoming data
      if (!data.message || typeof data.message !== 'string') {
        console.error('Invalid message format:', data);
        return;
      }

      // Save the message to MongoDB
      const newMessage = new Message({
        username: data.username || 'anonymous',
        message: data.message,
      });

      try {
        await newMessage.save(); // Save the message document
        console.log('💾 Message saved to MongoDB');

        // Broadcast the message to all clients, including the sender
        io.emit('chat-message', newMessage);
      } catch (error) {
        console.error('❌ Error saving message to MongoDB:', error);
        socket.emit('error', { message: 'Failed to save message' });
      }
    });

    socket.on('feedback', (data) => {
      // Handle feedback events if necessary
      socket.broadcast.emit('feedback', data);
    });
  });

  // Start the server after setting up Socket.io
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1); // Exit the process if DB connection fails
});
