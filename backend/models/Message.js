


const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  deletedBySender: { type: Boolean, default: false },       // 👈 NEW
  deletedByRecipient: { type: Boolean, default: false },    // 👈 NEW
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);