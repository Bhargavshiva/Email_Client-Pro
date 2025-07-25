

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { sendMessage, getInbox, markAsRead,deleteMessage,getSent,
  getTrash,
  } = require('../controllers/messageController');

router.post('/send', auth, sendMessage);
router.get('/inbox', auth, getInbox);
router.patch('/read/:id', auth, markAsRead);
router.delete('/:id', auth, deleteMessage);
router.get('/sent', auth, getSent);
router.get('/trash', auth, getTrash);
module.exports = router;