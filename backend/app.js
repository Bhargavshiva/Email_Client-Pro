
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // ✅ Required for frontend communication
const path = require("path");
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');

dotenv.config();
const app = express();

// Middleware
app.use(cors()); // ✅ Important for frontend <-> backend communication
app.use(express.json());

// DB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
// app.use('/uploads', express.static(path.join(__dirname, "middleware/uploads")));
// Start server
 app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.listen(3000, () => console.log('Server running on port 3000'));


app.use(cors({
  origin: "http://localhost:5174",  // your frontend
  credentials: true
}));


// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const cors = require('cors'); // ✅ Required for frontend communication
// const path = require("path");
// const authRoutes = require('./routes/auth');
// const messageRoutes = require('./routes/messages');

// dotenv.config();
// const app = express();

// // Middleware
// app.use(cors()); // ✅ Important for frontend <-> backend communication
// app.use(express.json());

// // DB Connection
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.error('MongoDB connection error:', err));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/messages', messageRoutes);
// // app.use('/uploads', express.static(path.join(__dirname, "middleware/uploads")));
// // Start server
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.listen(3000, () => console.log('Server running on port 3000'));
