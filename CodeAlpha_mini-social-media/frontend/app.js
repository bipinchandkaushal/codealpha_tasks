const URL = 'http://localhost:5000/api/posts';

document.addEventListener("DOMContentLoaded", () => {
  dikhaoPosts();
  setupInfiniteScroll();
});

// 1. Dark Mode Toggle Tracker
function toggleDarkMode() {
  const body = document.body;
  if(body.classList.contains("light-mode")) {
    body.classList.remove("light-mode");
    body.classList.add("dark-mode");
    document.querySelector(".dark-mode-toggle").innerText = "☀️";
  } else {
    body.classList.remove("dark-mode");
    body.classList.add("light-mode");
    document.querySelector(".dark-mode-toggle").innerText = "🌙";
  }
}

// 2. Clickable Story Popup Simulator
function openStory(name) {
  alert(`✨ Opening Live Story of ${name}...\n(Feature Integration: Success)`);
}

// 3. Render Post Cards
async function dikhaoPosts() {
  const response = await fetch(URL);
  const data = await response.json();
  
  const feedBox = document.getElementById("feedBox");
  feedBox.innerHTML = ""; 

  data.reverse().forEach(post => {
    const div = document.createElement("div");
    div.classList.add("glass-card");
    div.innerHTML = `
      <div class="card-header">
        <strong>👤 @${post.username}</strong>
        <span style="font-size:12px; color:var(--text-muted)">Active Now</span>
      </div>
      <p style="margin-bottom: 15px;">${post.content}</p>
      <div class="post-actions-buttons">
        <button class="action-btn" onclick="likePost('${post._id}')">👍 Like (${post.likes || 0})</button>
        <button class="action-btn" onclick="alert('Comment box is active for writing!')">💬 Comment</button>
        <button class="action-btn" onclick="navigator.clipboard.writeText(window.location.href); alert('Link copied to clipboard!')">🔗 Share</button>
      </div>
    `;
    feedBox.appendChild(div);
  });
}

// 4. Send Post to Database
async function bhejoPost() {
  const username = document.getElementById("nameInput").value;
  const content = document.getElementById("contentInput").value;

  if(!username || !content) return alert("Please type your Name & Content first!");

  // Left Sidebar Summary dynamic data update
  document.getElementById("profile-name").innerText = username;
  document.querySelector(".handle").innerText = "@" + username.toLowerCase().replace(/\s+/g, '');

  await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, content, likes: 0 })
  });

  document.getElementById("contentInput").value = ""; 
  dikhaoPosts(); 
}

// 5. Like Increment
async function likePost(id) {
  await fetch(`${URL}/${id}/like`, { method: "PUT" });
  dikhaoPosts();
}

// 6. UX FEATURE: Infinite Scroll Simulation detection
function setupInfiniteScroll() {
  window.addEventListener("scroll", () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2) {
      document.getElementById("scrollLoader").innerText = "🔄 Loading older historic posts from archive database...";
      
      setTimeout(() => {
        document.getElementById("scrollLoader").innerText = "✅ All clear! You have caught up with everyone.";
      }, 1500);
    }
  });
}