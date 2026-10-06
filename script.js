// Target UI Elements
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsGrid = document.getElementById("results");
const statusText = document.getElementById("status");
const emptyState = document.getElementById("empty-state");
const chips = document.querySelectorAll(".chip");

// 1. Event Listener for Form Submission
searchForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent page reload
  const query = searchInput.value.trim();
  if (query) {
    fetchImages(query);
  }
});

// Category Chips Click Handler
chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const query = chip.textContent.trim();
    searchInput.value = query;
    fetchImages(query);
  });
});

// 2. Fetch Data from Wikimedia Commons API
async function fetchImages(query) {
  // Show loading indicator & reset previous view
  statusText.textContent = `Searching for "${query}"...`;
  resultsGrid.innerHTML = "";
  emptyState.style.display = "none";

  // Key-free, CORS-enabled Wikimedia Commons API Endpoint
  const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
    query
  )}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url|mime&format=json&origin=*`;

  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error("Network response failed");
    }

    const data = await response.json();
    const pages = data.query?.pages ? Object.values(data.query.pages) : [];

    // Filter for valid image file types only
    const imageFiles = pages.filter(
      (page) => page.imageinfo && page.imageinfo[0]?.mime?.startsWith("image/")
    );

    renderResults(imageFiles, query);
  } catch (error) {
    console.error("Fetch error:", error);
    statusText.textContent = "Failed to load images. Please try again.";
  }
}

// 3. Render Results as Cards into Grid
function renderResults(images, query) {
  if (images.length === 0) {
    statusText.textContent = `No image results found for "${query}". Try another search!`;
    return;
  }

  statusText.textContent = `Showing ${images.length} results for "${query}"`;

  images.forEach((img) => {
    const info = img.imageinfo[0];
    const card = document.createElement("article");
    card.className = "card";

    // Clean up title display string
    const title = img.title.replace("File:", "").replace(/\.[^/.]+$/, "");

    card.innerHTML = `
      <div class="card-image-wrapper">
        <img src="${info.url}" alt="${title}" loading="lazy" />
      </div>
      <div class="card-content">
        <h3 class="card-title">${title}</h3>
      </div>
    `;

    resultsGrid.appendChild(card);
  });
}