import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'New Chat'
  },
  messages: [messageSchema],
  model: {
    type: String,
    default: 'gpt-4'
  }
}, {
  timestamps: true
});

// Update title when first user message is added
chatSchema.pre('save', function(next) {
  if (this.isModified('messages') && this.messages.length > 0) {
    const firstUserMessage = this.messages.find(msg => msg.role === 'user');
    if (firstUserMessage && this.title === 'New Chat') {
      this.title = firstUserMessage.content.substring(0, 50) + '...';
    }
  }
  next();
});

export default mongoose.model('Chat', chatSchema);
