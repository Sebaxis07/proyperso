import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sessionId: {
    type: String,
    required: true
  }
});

export default mongoose.model('ChatMessage', MessageSchema);
