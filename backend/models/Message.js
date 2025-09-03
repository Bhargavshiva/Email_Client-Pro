

const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  deletedBySender: { type: Boolean, default: false },
  deletedByRecipient: { type: Boolean, default: false },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null }, // 👈 NEW
  attachment: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);

