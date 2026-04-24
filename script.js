let inventory = JSON.parse(localStorage.getItem("bookInventory")) || [];
let currentFilter = "All";
let searchCache = [];

const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const inventoryList = document.getElementById("inventoryList");
const message = document.getElementById("message");

document.addEventListener("DOMContentLoaded", () => {
  checkOverdueBooks();
  displayInventory();
  updateDashboard();
});

searchInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    searchBooks();
  }
});

async function searchBooks() {
  const query = searchInput.value.trim();

  if (query === "") {
    showMessage("Please enter a book title or ISBN.", "error");
    return;
  }

  searchResults.innerHTML = "";
  showMessage("Searching books...", "loading");

  try {
    const apiURL = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8`;
    const response = await fetch(apiURL);

    if (!response.ok) {
      throw new Error("Unable to fetch data.");
    }

    const data = await response.json();

    if (!data.docs || data.docs.length === 0) {
      showMessage("No books found. Try another title or ISBN.", "error");
      return;
    }

    showMessage(`Found ${data.docs.length} result/s. Select a book to add.`, "success");
    displaySearchResults(data.docs);
  } catch (error) {
    showMessage("Something went wrong while fetching book data.", "error");
    console.error(error);
  }
}

function displaySearchResults(books) {
  searchResults.innerHTML = "";
  searchCache = [];

  books.forEach((book, index) => {
    const title = book.title || "Unknown Title";
    const author = book.author_name ? book.author_name[0] : "Unknown Author";
    const year = book.first_publish_year || "N/A";
    const cover = book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : "https://via.placeholder.com/200x300?text=No+Cover";

    const bookData = {
      id: book.key || `${title}-${author}-${year}`,
      title,
      author,
      year,
      cover,
      status: "Available",
      borrower: "",
      borrowedDate: "",
      dueDate: "",
      dateAdded: new Date().toLocaleDateString()
    };

    searchCache.push(bookData);

    const card = document.createElement("div");
    card.className = "book-card";

    card.innerHTML = `
      <img src="${cover}" alt="${title}">
      <div>
        <h3>${title}</h3>
        <p><strong>Author:</strong> ${author}</p>
        <p><strong>First Published:</strong> ${year}</p>
      </div>
      <button onclick="addToInventoryFromSearch(${index})">
        Add to Inventory
      </button>
    `;

    searchResults.appendChild(card);
  });
}

function addToInventoryFromSearch(index) {
  const book = searchCache[index];

  if (!book) {
    showAppNotification("Book data not found. Please search again.", "error");
    return;
  }

  addToInventory(book);
}

function addToInventory(book) {
  const alreadyExists = inventory.some((item) => item.id === book.id);

  if (alreadyExists) {
    showAppNotification("This book is already in your inventory.", "error");
    return;
  }

  inventory.push(book);
  saveInventory();
  displayInventory();
  updateDashboard();

  showAppNotification(`"${book.title}" added to inventory.`, "success");
}

function displayInventory() {
  checkOverdueBooks();
  inventoryList.innerHTML = "";

  let filteredInventory = inventory;

  if (currentFilter !== "All") {
    filteredInventory = inventory.filter((book) => book.status === currentFilter);
  }

  if (filteredInventory.length === 0) {
    inventoryList.innerHTML = `
      <p class="note">No ${currentFilter === "All" ? "" : currentFilter.toLowerCase()} books found.</p>
    `;
    return;
  }

  filteredInventory.forEach((book) => {
    const realIndex = inventory.indexOf(book);

    const card = document.createElement("div");
    card.className = "book-card";

    let circulationDetails = "";

    if (book.status === "Borrowed" || book.status === "Overdue") {
      circulationDetails = `
        <p><strong>Borrowed By:</strong> ${book.borrower}</p>
        <p><strong>Borrowed Date:</strong> ${book.borrowedDate}</p>
        <p><strong>Due Date:</strong> ${book.dueDate}</p>
        <p><strong>Loan Period:</strong> 7 days</p>
      `;
    }

    let actionButtons = "";

    if (book.status === "Available") {
      actionButtons = `
        <div class="borrow-form">
          <input type="text" id="borrower-${realIndex}" placeholder="Borrower's name">
          <button onclick="borrowBook(${realIndex})">Mark as Borrowed</button>
        </div>
      `;
    } else {
      actionButtons = `
        <button onclick="markAvailable(${realIndex})">Mark as Available</button>
      `;
    }

    card.innerHTML = `
      <img src="${book.cover}" alt="${book.title}">
      <div>
        <h3>${book.title}</h3>
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>Year:</strong> ${book.year}</p>
        <p><strong>Date Added:</strong> ${book.dateAdded}</p>

        <span class="status-badge ${getStatusBadge(book.status)}">
          ${book.status}
        </span>

        ${circulationDetails}
        ${actionButtons}
      </div>

      <button class="delete-btn" onclick="deleteBook(${realIndex})">
        Delete Record
      </button>
    `;

    inventoryList.appendChild(card);
  });
}

function filterInventory(status) {
  currentFilter = status;

  searchResults.innerHTML = "";
  searchInput.value = "";
  showMessage("", "loading");

  document.querySelectorAll(".dash-card").forEach((card) => {
    card.classList.remove("active-filter");
  });

  const selectedCard = document.querySelector(`[data-filter="${status}"]`);
  if (selectedCard) {
    selectedCard.classList.add("active-filter");
  }

  displayInventory();

  const inventorySection = document.querySelector(".inventory-section");
  if (inventorySection) {
    inventorySection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

function borrowBook(index) {
  const borrowerInput = document.getElementById(`borrower-${index}`);
  const borrower = borrowerInput.value.trim();

  if (borrower === "") {
    showAppNotification("Please enter the borrower’s name.", "error");
    return;
  }

  const today = new Date();
  const dueDate = new Date();

  dueDate.setDate(today.getDate() + 7);

  inventory[index].status = "Borrowed";
  inventory[index].borrower = borrower;
  inventory[index].borrowedDate = formatDate(today);
  inventory[index].dueDate = formatDate(dueDate);

  saveInventory();
  displayInventory();
  updateDashboard();

  showAppNotification(`"${inventory[index].title}" borrowed. Due in 7 days.`, "success");
}

function markAvailable(index) {
  inventory[index].status = "Available";
  inventory[index].borrower = "";
  inventory[index].borrowedDate = "";
  inventory[index].dueDate = "";

  saveInventory();
  displayInventory();
  updateDashboard();

  showAppNotification(`"${inventory[index].title}" is now available.`, "success");
}

function checkOverdueBooks() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  inventory.forEach((book) => {
    if (book.status === "Borrowed" && book.dueDate) {
      const dueDate = new Date(book.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (today > dueDate) {
        book.status = "Overdue";
      }
    }
  });

  saveInventory();
}

function deleteBook(index) {
  const confirmDelete = confirm("Are you sure you want to delete this book record?");

  if (confirmDelete) {
    inventory.splice(index, 1);
    saveInventory();
    displayInventory();
    updateDashboard();
    showAppNotification("Book record deleted.", "success");
  }
}

function clearInventory() {
  if (inventory.length === 0) {
    showAppNotification("Inventory is already empty.", "error");
    return;
  }

  const confirmClear = confirm("Are you sure you want to clear the entire inventory?");

  if (confirmClear) {
    inventory = [];
    saveInventory();
    displayInventory();
    updateDashboard();
    showAppNotification("Inventory cleared successfully.", "success");
  }
}

function updateDashboard() {
  checkOverdueBooks();

  const total = inventory.length;
  const available = inventory.filter((book) => book.status === "Available").length;
  const borrowed = inventory.filter((book) => book.status === "Borrowed").length;
  const overdue = inventory.filter((book) => book.status === "Overdue").length;

  document.getElementById("totalBooks").textContent = total;
  document.getElementById("availableBooks").textContent = available;
  document.getElementById("borrowedBooks").textContent = borrowed;
  document.getElementById("overdueBooks").textContent = overdue;
}

function saveInventory() {
  localStorage.setItem("bookInventory", JSON.stringify(inventory));
}

function getStatusBadge(status) {
  if (status === "Available") return "badge-available";
  if (status === "Borrowed") return "badge-borrowed";
  if (status === "Overdue") return "badge-overdue";
  return "badge-available";
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function showMessage(text, type) {
  if (!text) {
    message.textContent = "";
    return;
  }

  message.textContent = text;

  if (type === "error") {
    message.style.color = "#8a2f2f";
  } else if (type === "success") {
    message.style.color = "#3f7d4a";
  } else {
    message.style.color = "#6b3f28";
  }
}

function showAppNotification(text, type = "success") {
  const notif = document.getElementById("appNotification");

  if (!notif) {
    alert(text);
    return;
  }

  notif.textContent = text;
  notif.className = type;
  notif.style.display = "block";

  setTimeout(() => {
    notif.style.display = "none";
  }, 2500);
}