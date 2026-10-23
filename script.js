const starterPosts = [
  { id: 1, name: "Mila", handle: "@milacreate", initial: "M", tag: "Créativité", text: "Et si on créait un endroit sur Internet où on peut partager ses projets, même quand ils ne sont pas encore parfaits ? ✨", likes: 12, liked: false, saved: false, time: "Il y a 2 h" },
  { id: 2, name: "Noé", handle: "@noe.exe", initial: "N", tag: "Gaming", text: "Petit défi du jour : découvrir un jeu dont personne ne parle et lui donner une chance. Vous jouez à quoi en ce moment ? 🎮", likes: 8, liked: false, saved: false, time: "Il y a 4 h" },
  { id: 3, name: "Sacha", handle: "@sacha", initial: "S", tag: "Discussion", text: "Question : si vous pouviez apprendre instantanément une nouvelle compétence, vous choisiriez quoi ?", likes: 5, liked: false, saved: false, time: "Hier" }
];

let posts = loadPosts();
let currentView = "feed";
let currentFilter = "all";
const postsContainer = document.querySelector("#posts");
const postForm = document.querySelector("#post-form");
const postText = document.querySelector("#post-text");
const charCount = document.querySelector("#char-count");

function loadPosts() {
  try {
    const saved = localStorage.getItem("orbit-posts");
    return saved ? JSON.parse(saved) : starterPosts;
  } catch {
    return starterPosts;
  }
}
function savePosts() {
  try { localStorage.setItem("orbit-posts", JSON.stringify(posts)); } catch {}
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}
function renderPosts() {
  let visible = [...posts];
  if (currentView === "saved") visible = visible.filter(post => post.saved);
  if (currentView === "discover") visible.sort((a, b) => b.likes - a.likes);
  if (currentFilter === "popular") visible.sort((a, b) => b.likes - a.likes);

  document.querySelector("#page-title").textContent =
    currentView === "discover" ? "Découvrir" :
    currentView === "saved" ? "Mes favoris" : "Le fil d’actualité";
  document.querySelector("#feed-subtitle").textContent =
    currentView === "discover" ? "Les posts populaires" :
    currentView === "saved" ? "Tes posts enregistrés" : "Les dernières idées";

  if (!visible.length) {
    postsContainer.innerHTML = `<div class="empty-state"><strong>${currentView === "saved" ? "Pas encore de favoris" : "Le fil est calme pour l’instant"}</strong>${currentView === "saved" ? "Enregistre une publication avec le bouton ☆ pour la retrouver ici." : "Sois la première personne à publier une idée !"}</div>`;
  } else {
    postsContainer.innerHTML = visible.map(post => `
      <article class="post-card">
        <div class="post-top">
          <div class="avatar" style="background:${avatarColor(post.initial)}">${escapeHTML(post.initial)}</div>
          <div class="post-meta"><strong>${escapeHTML(post.name)}</strong><small>${escapeHTML(post.handle)} · ${escapeHTML(post.time)}</small></div>
          <span class="post-tag">${escapeHTML(post.tag || "Communauté")}</span>
        </div>
        <p class="post-text">${escapeHTML(post.text)}</p>
        <div class="post-actions">
          <button class="action-button ${post.liked ? "liked" : ""}" data-action="like" data-id="${post.id}" aria-label="Aimer la publication">♡ ${post.likes}</button>
          <button class="action-button ${post.saved ? "liked" : ""}" data-action="save" data-id="${post.id}">${post.saved ? "★ Enregistré" : "☆ Enregistrer"}</button>
        </div>
      </article>`).join("");
  }
  document.querySelector("#post-total").textContent = posts.filter(p => p.handle === "@toi").length;
  document.querySelector("#like-total").textContent = posts.filter(p => p.handle !== "@toi" && p.liked).length;
}
function avatarColor(initial) {
  const colors = ["linear-gradient(135deg,#ff8fc8,#8c7cff)", "linear-gradient(135deg,#6fe7db,#5275ce)", "linear-gradient(135deg,#ffbd75,#ef7f9d)", "linear-gradient(135deg,#9b8cff,#6c5dd3)"];
  return colors[initial.charCodeAt(0) % colors.length];
}

postText.addEventListener("input", () => {
  charCount.textContent = `${postText.value.length} / 280`;
});
postForm.addEventListener("submit", event => {
  event.preventDefault();
  const text = postText.value.trim();
  if (!text) return;
  posts.unshift({
    id: Date.now(), name: "Toi", handle: "@toi", initial: "Y",
    tag: "Ta publication", text, likes: 0, liked: false, saved: false, time: "À l’instant"
  });
  savePosts();
  postText.value = "";
  charCount.textContent = "0 / 280";
  currentView = "feed";
  currentFilter = "all";
  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.toggle("active", btn.dataset.view === "feed"));
  document.querySelectorAll(".filter").forEach(btn => btn.classList.toggle("active", btn.dataset.filter === "all"));
  renderPosts();
});
postsContainer.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const post = posts.find(item => String(item.id) === button.dataset.id);
  if (!post) return;
  if (button.dataset.action === "like") {
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
  } else if (button.dataset.action === "save") {
    post.saved = !post.saved;
  }
  savePosts();
  renderPosts();
});
document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    currentView = button.dataset.view;
    currentFilter = "all";
    document.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item === button));
    document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item.dataset.filter === "all"));
    renderPosts();
  });
});
document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
    renderPosts();
  });
});
renderPosts();
