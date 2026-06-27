const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/ecommerceDB')
  .then(async () => {
    console.log("E-Commerce DB Connected Successfully!");
    
    // Automatic 8+ Premium Items Loader if empty
    await Product.deleteMany({}); // Purane items clear karke fresh dher saare items inject kar rahe hain
    await Product.insertMany([
      { name: "Pro Wireless Noise-Canceling Headphones", price: 3499, description: "Experience pure audio with hybrid active noise cancellation, 40-hour battery life, and deep bass engineering.", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", category: "Electronics" },
      { name: "Minimalist Sports Smartwatch v2", price: 4999, description: "Amoled display, heart rate tracking, 5ATM water resistance, and premium silicone strap.", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", category: "Electronics" },
      { name: "Classic Tan Leather Backpack", price: 2499, description: "Handcrafted genuine leather backpack with dedicated 15.6 inch laptop compartment and vintage metallic zippers.", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", category: "Fashion" },
      { name: "Air-Cushioned Retro Sneakers", price: 3999, description: "Lightweight running sneakers with breathable mesh design and shock-absorbing rubber soles.", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", category: "Footwear" },
      { name: "Full-Frame Professional DSLR Camera", price: 54999, description: "24.2 MP camera with ultra-fast autofocus, 4K video recording capability, and bundled 18-55mm lens kit.", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500", category: "Electronics" },
      { name: "Premium Ergonomic Gaming Chair", price: 12499, description: "High-back PU leather chair with adjustable lumbar support, 180-degree recline, and 4D armrests.", image: "https://images.unsplash.com/photo-1598550476439-6847785fce6e?w=500", category: "Furniture" },
      { name: "Mechanical RGB Backlit Keyboard", price: 2899, description: "Tactile blue switches, customizable dynamic RGB lighting patterns, and fully anti-ghosting keys.", image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500", category: "Electronics" },
      { name: "Designer Oversized Cotton Hoodie", price: 1799, description: "100% premium heavy-gauge cotton fleece, drop shoulder minimalist urban streetwear apparel.", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500", category: "Fashion" }
    ]);
    console.log("Dher saare products inject ho gaye database mein!");
  });

// --- AUTHENTICATION ENDPOINTS ---
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if(!username || !email || !password) return res.status(400).json({ error: "Please fill all registration fields!" });
    
    const existing = await User.findOne({ email });
    if(existing) return res.status(400).json({ error: "This Email is already registered!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "Account created successfully! Now type credentials and click Login." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ error: "Please provide both email and password!" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "No account found with this email. Please register first!" });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Incorrect password! Please try again." });
    
    res.json({ message: "Welcome Back!", userId: user._id, username: user.username });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.json(product);
});

// --- ORDERS ---
app.post('/api/orders', async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.status(201).json({ message: "🎉 Order Placed Successfully! Thank you for shopping with us.", order });
});

app.listen(5000, () => console.log("E-com Mega Backend ready on port 5000"));