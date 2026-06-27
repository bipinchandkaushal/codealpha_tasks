const BACKEND = 'http://localhost:5000/api';
let allProductsArray = []; // Copy backing data global for dynamic frontend operations

document.addEventListener("DOMContentLoaded", () => {
  updateHeader();
  
  if(document.getElementById("productGrid")) loadProducts();
  if(document.getElementById("detailBox")) loadProductDetails();
  if(document.getElementById("cartItems")) renderCart();
});

function updateHeader() {
  const username = localStorage.getItem("username");
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  if(document.getElementById("cartCount")) document.getElementById("cartCount").innerText = cart.length;
  if(username && document.getElementById("userGreeting")) {
    document.getElementById("userGreeting").innerText = `Account: ${username} ✅`;
    if(document.getElementById("loginBtn")) document.getElementById("loginBtn").style.display = 'none';
  }
}

// Load Products with Automatic Grid Renderer
async function loadProducts() {
  const res = await fetch(`${BACKEND}/products`);
  allProductsArray = await res.json();
  renderGridItems(allProductsArray);
}

function renderGridItems(items) {
  const grid = document.getElementById("productGrid");
  if(items.length === 0) {
    grid.innerHTML = `<p>No products found in this category.</p>`;
    return;
  }
  grid.innerHTML = items.map(p => `
    <div class="product-card">
      <img src="${p.image}">
      <h3>${p.name}</h3>
      <div class="rating-stars">★ ★ ★ ★ ☆ <span style='color:#6c757d'>(4.2)</span></div>
      <div class="price">₹${p.price.toLocaleString('en-IN')}</div>
      <button class="view-btn" onclick="window.location.href='product.html?id=${p._id}'">View Mega Detail</button>
    </div>
  `).join('');
}

// Category Fast Filter Framework switcher
function filterCategory(catName) {
  // Update UI tabs visibility active flag
  const tabs = document.querySelectorAll('.cat-tab');
  tabs.forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');

  if(catName === 'All') {
    renderGridItems(allProductsArray);
  } else {
    const filtered = allProductsArray.filter(p => p.category === catName);
    renderGridItems(filtered);
  }
}

// View Details Page Loader
async function loadProductDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const res = await fetch(`${BACKEND}/products/${id}`);
  const p = await res.json();
  
  document.getElementById("detailBox").innerHTML = `
    <img src="${p.image}" class="detail-img">
    <div style="flex:1;">
      <span style="background:#0d6efd; color:white; padding:4px 10px; font-size:11px; border-radius:5px; font-weight:bold;">${p.category}</span>
      <h1 style="margin:15px 0 10px; font-size:28px;">${p.name}</h1>
      <div style="color:#ffc107; margin-bottom:15px;">★ ★ ★ ★ ☆ (84 Customer Reviews)</div>
      <h2 style="color:#198754; font-size:26px; margin-bottom:20px;">₹${p.price.toLocaleString('en-IN')}</h2>
      <p style="line-height:1.7; color:#555; margin-bottom:30px;">${p.description}</p>
      <button class="checkout-btn" style="background:#ffc107; color:#212529;" onclick="addToCart('${p._id}', '${p.name}', ${p.price})">🛒 Add To Global Shopping Cart</button>
    </div>
  `;
}

function addToCart(productId, name, price) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const exists = cart.find(item => item.productId === productId);
  if(exists) exists.quantity += 1;
  else cart.push({ productId, name, price, quantity: 1 });
  
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Item added to cart dashboard successfully!");
  window.location.href = "cart.html";
}

function renderCart() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const itemsContainer = document.getElementById("cartItems");
  let total = 0;

  if(cart.length === 0) {
    itemsContainer.innerHTML = "<p style='text-align:center; padding:4px; color:#6c757d;'>Your checkout cart is empty.</p>";
    return;
  }

  itemsContainer.innerHTML = cart.map(item => {
    total += item.price * item.quantity;
    return `
      <div class="cart-item">
        <div><span style='font-weight:bold; font-size:16px;'>${item.name}</span><br><span style='color:#6c757d'>Quantity ordered: ${item.quantity}</span></div>
        <div style='font-weight:bold; color:#198754;'>₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
      </div>
    `;
  }).join('');
  document.getElementById("totalCost").innerText = total.toLocaleString('en-IN');
}

async function placeOrder() {
  const userId = localStorage.getItem("userId");
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  
  if(!userId) return alert("Security Warning: Please Log in with your email/password portal first before processing order checkout!");
  if(cart.length === 0) return alert("Your shopping cart listing dashboard is currently empty!");

  const res = await fetch(`${BACKEND}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, items: cart, totalAmount: 5000 }) 
  });
  const data = await res.json();
  alert(data.message);
  localStorage.removeItem("cart");
  window.location.href = "index.html";
}

// --- SECURE ACCOUNT GATEWAY OPERATION HANDLERS ---
async function handleSignup() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${BACKEND}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  });
  const d = await res.json();
  if(d.error) {
    alert("❌ Error: " + d.error);
  } else {
    alert("✅ " + d.message);
  }
}

async function handleLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${BACKEND}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const d = await res.json();
  if(d.error) {
    alert("❌ Login Denied: " + d.error);
  } else {
    localStorage.setItem("userId", d.userId);
    localStorage.setItem("username", d.username);
    alert("🚀 Login Successful! Welcome " + d.username + ". Redirecting to Mega Store Dashboard.");
    window.location.href = "index.html";
  }
}