const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Post = require('./models/Post');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/socialApp')
  .then(() => console.log("Database Connect Ho Gaya!"))
  .catch(err => console.log("DB Error:", err));

// Route 1: Saare posts lena
app.get('/api/posts', async (req, res) => {
  const allPosts = await Post.find();
  res.json(allPosts);
});

// Route 2: Naya post add karna
app.post('/api/posts', async (req, res) => {
  const newPost = new Post(req.body);
  await newPost.save();
  res.json({ message: "Post saved!", post: newPost });
});

// Route 3: NAYA FEATURE - Like update karna (PUT)
app.put('/api/posts/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.likes = (post.likes || 0) + 1; // 1 Like badha diya
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Backend chal raha hai port 5000 par!"));