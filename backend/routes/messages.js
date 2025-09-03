
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { sendMessage, getInbox, markAsRead,deleteMessage,getSent,
  getTrash,replyMessage,
  } = require('../controllers/messageController');
  const upload = require('../middleware/upload');

// router.post('/send', auth,sendMessage);

router.post('/send', auth, upload.single("attachment"), sendMessage);
router.get('/inbox', auth, getInbox);
router.patch('/read/:id', auth, markAsRead);
router.delete('/:id', auth, deleteMessage);
router.get('/sent', auth, getSent);
router.get('/trash', auth, getTrash);
// router.post('/reply', authMiddleware, messageController.replyMessage);
// router.post('/reply', auth,replyMessage);
// router.post('/reply', auth, replyMessage);

router.post('/reply', auth, upload.single("attachment"), replyMessage);
module.exports = router;
