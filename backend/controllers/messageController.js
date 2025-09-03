
const Message = require('../models/Message');
const User = require('../models/User');
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
exports.sendMessage = async (req, res) => {
  const { toEmail, subject, body } = req.body;

  if (!toEmail || !subject || !body) {
    return res.status(400).json({ error: 'toEmail, subject, and body are required' });
  }

  try {
    const toUser = await User.findOne({ email: toEmail.toLowerCase() });
    if (!toUser) return res.status(404).json({ error: 'Recipient not found' });
   
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const message = new Message({
      from: req.user.id,
      to: toUser._id,
      subject,
      body,
      attachment:fileUrl,
    });

    await message.save();
    res.json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('Send message error:', err.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// 📥 Get Inbox (only messages not deleted by recipient)
exports.getInbox = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Message.countDocuments({
      to: req.user.id,
      deletedByRecipient: false,
    });

    const messages = await Message.find({
      to: req.user.id,
      deletedByRecipient: false,
    })
      //.populate('from', 'username email')
      .populate('from', 'email')  // 👈 get sender email
      .populate('to', 'email')    // 👈 get recipient email
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      fromEmail: msg.from?.email || 'Unknown',
      toEmail: msg.to?.email || null,
      subject: msg.subject,
      body: msg.body,
      read: msg.isRead,
      createdAt: msg.createdAt,
        attachment: msg.attachment ? `${BASE_URL}${msg.attachment}` : null,
    }));

    res.json({ messages: formattedMessages, total });
  } catch (err) {
    console.error('Get inbox error:', err.message);
    res.status(500).json({ error: 'Failed to get inbox' });
  }
};

// 📤 Get Sent Messages (only not deleted by sender)
exports.getSent = async (req, res) => {
  try {
    const messages = await Message.find({
      from: req.user.id,
      deletedBySender: false,
    })
      .populate('to', 'username email')
      .populate('from', 'email')
      .sort({ createdAt: -1 });

    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
       fromEmail: msg.from?.email || 'Unknown',
      toEmail: msg.to?.email || 'Unknown',
      subject: msg.subject,
      body: msg.body,
      read: msg.isRead,
      createdAt: msg.createdAt,
        attachment: msg.attachment ? `${BASE_URL}${msg.attachment}` : null,
    }));

    res.json({ messages: formattedMessages });
  } catch (err) {
    console.error('Get sent error:', err.message);
    res.status(500).json({ error: 'Failed to get sent messages' });
  }
};

// 📩 Mark as Read
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findOne({ _id: req.params.id, to: req.user.id });
    if (!message) return res.status(404).json({ error: 'Message not found' });

    message.isRead = true;
    await message.save();

    res.json({ message: 'Message marked as read' });
  } catch (err) {
    console.error('Mark as read error:', err.message);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};

// 🗑️ Soft Delete Message (by sender or recipient)
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    // Recipient deletes message
    if (message.to.toString() === req.user.id) {
      message.deletedByRecipient = true;
    }

    // Sender deletes message
    if (message.from.toString() === req.user.id) {
      message.deletedBySender = true;
    }

    await message.save();
    res.json({ message: 'Message moved to trash' });
  } catch (err) {
    console.error('Delete message error:', err.message);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

// 🗂️ Get Trash (messages deleted by current user)
exports.getTrash = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { to: req.user.id, deletedByRecipient: true },
        { from: req.user.id, deletedBySender: true },
      ],
    })
      .populate('from to', 'email')
      .sort({ createdAt: -1 });

    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      fromEmail: msg.from?.email,
      toEmail: msg.to?.email,
      subject: msg.subject,
      body: msg.body,
      read: msg.isRead,
      createdAt: msg.createdAt,
        attachment: msg.attachment ? `${BASE_URL}${msg.attachment}` : null,
    }));

    res.json({ messages: formattedMessages });
  } catch (err) {
    console.error('Get trash error:', err.message);
    res.status(500).json({ error: 'Failed to get trash' });
  }
};

// ... your existing code (sendMessage, getInbox, etc.)

// 📩 Reply to a Message
exports.replyMessage = async (req, res) => {
  const { originalMessageId, body } = req.body;

  if (!originalMessageId || !body) {
    return res.status(400).json({ error: 'originalMessageId and body are required' });
  }

  try {
    const original = await Message.findById(originalMessageId).populate('from');
    if (!original) return res.status(404).json({ error: 'Original message not found' });
      const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const reply = new Message({
      from: req.user.id,
      to: original.from._id, // reply goes back to sender
      subject: `Re: ${original.subject}`,
      body,
      replyTo: original._id, // 👈 link to original
        attachment: fileUrl,
    });

    await reply.save();
    res.json({ message: 'Reply sent successfully' });
  } catch (err) {
    console.error('Reply message error:', err.message);
    res.status(500).json({ error: 'Failed to send reply' });
  }
};
// Get Sent Messages (with pagination)
exports.getSent = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const total = await Message.countDocuments({
      from: req.user.id,
      deletedBySender: false,
    });

    const messages = await Message.find({
      from: req.user.id,
      deletedBySender: false,
    })
      .populate('to', 'username email')
      .populate('from', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
       fromEmail: msg.from?.email,
      toEmail: msg.to?.email || 'Unknown',
      subject: msg.subject,
      body: msg.body,
      read: msg.isRead,
      createdAt: msg.createdAt,
       attachment: msg.attachment ? `${BASE_URL}${msg.attachment}` : null,
    }));

    res.json({ messages: formattedMessages, total });
  } catch (err) {
    console.error('Get sent error:', err.message);
    res.status(500).json({ error: 'Failed to get sent messages' });
  }
};

// Get Trash Messages (with pagination)
exports.getTrash = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      $or: [
        { to: req.user.id, deletedByRecipient: true },
        { from: req.user.id, deletedBySender: true },
      ],
    };

    const total = await Message.countDocuments(filter);

    const messages = await Message.find(filter)
      .populate('from to', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      fromEmail: msg.from?.email,
      toEmail: msg.to?.email,
      subject: msg.subject,
      body: msg.body,
      read: msg.isRead,
      createdAt: msg.createdAt,
       attachment: msg.attachment ? `${BASE_URL}${msg.attachment}` : null,
    }));

    res.json({ messages: formattedMessages, total });
  } catch (err) {
    console.error('Get trash error:', err.message);
    res.status(500).json({ error: 'Failed to get trash' });
  }
};
