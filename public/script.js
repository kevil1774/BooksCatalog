
// =====================================
// ELEMENTS
// =====================================

const shelfContainer = document.getElementById("shelf-container");
const searchInput = document.getElementById("search-input");
const clearSearch = document.getElementById("clear-search");
const bookCount = document.getElementById("book-count");

const modal = document.getElementById("book-modal");
const closeModal = document.getElementById("close-modal");
const heroDetails = document.getElementById("hero-details");
const modalCover = document.getElementById("modal-cover");

let books = [];
let featuredBook = null;
let selectedModalBook = null;


// =====================================
// LOCAL BOOK COVER IMAGES
// =====================================

const bookCovers = {
    b1: "/images/three-body.jpg",
    b2: "/images/jane-eyre.jpg",
    b3: "/images/pride-prejudice.jpg",
    b4: "/images/english-patient.jpg",
    b5: "/images/small-gods.jpg"
};

const coverColors = [
    "#B9C9C2",
    "#D8BCA5",
    "#A9B9A3",
    "#D7C5A5",
    "#B7ABC5"
];


// =====================================
// FETCH BOOKS
// =====================================

async function loadBooks() {

    try {

        const response = await fetch("/api/books");

        if (!response.ok) {
            throw new Error("Unable to load books");
        }

        books = await response.json();

        updateStatistics();
        displayBooks(books);

        if (books.length > 0) {
            featuredBook = books[0];
            displayFeaturedBook(featuredBook);
        }

    } catch (error) {

        shelfContainer.innerHTML =
            '<p class="empty-shelf">Unable to load your library.</p>';

        console.error("Book loading error:", error);

    }
}


// =====================================
// UPDATE STATISTICS
// =====================================

function updateStatistics() {

    const genres = new Set(
        books.map(book => book.genre)
    );

    document.getElementById("total-books").textContent =
        String(books.length).padStart(2, "0");

    document.getElementById("total-genres").textContent =
        String(genres.size).padStart(2, "0");

}


// =====================================
// FEATURED BOOK
// =====================================

function displayFeaturedBook(book) {

    featuredBook = book;

    document.getElementById("hero-title").textContent =
        book.title;

    document.getElementById("hero-genre").textContent =
        book.genre.toUpperCase();

    document.getElementById("hero-author").textContent =
        `By ${book.author}`;

    document.getElementById("hero-summary").textContent =
        book.summary;

    document.getElementById("hero-year").textContent =
        book.year;

}


// =====================================
// GET LOCAL BOOK COVER
// =====================================

function getBookCover(book) {

    return bookCovers[String(book.id)] || null;

}


// =====================================
// DISPLAY BOOK COLLECTION
// =====================================

function displayBooks(data) {

    shelfContainer.innerHTML = "";

    bookCount.textContent =
        `${String(data.length).padStart(2, "0")} BOOKS`;

    if (data.length === 0) {

        shelfContainer.innerHTML =
            '<p class="empty-shelf">No books found. Try another search.</p>';

        return;

    }

    data.forEach(book => {

        const card = createBookCard(book);

        shelfContainer.appendChild(card);

    });

}


// =====================================
// CREATE BOOK POSTER
// =====================================

function createBookCard(book) {

    const index = books.findIndex(
        item => String(item.id) === String(book.id)
    );

    const item = document.createElement("div");
    item.className = "book-item";

    const cover = document.createElement("div");
    cover.className = "book-cover";

    cover.style.backgroundColor =
        coverColors[(index < 0 ? 0 : index) % coverColors.length];

    const image = document.createElement("img");
    image.className = "book-cover-image";
    image.alt = `${book.title} book cover`;
    image.loading = "lazy";

    const coverUrl = getBookCover(book);

    if (coverUrl) {

        image.src = coverUrl;

        image.onload = () => {
            image.classList.add("loaded");
        };

        image.onerror = () => {
            console.error("Unable to load cover:", coverUrl);
            image.removeAttribute("src");
        };

    }

    const fallback = document.createElement("div");
    fallback.className = "cover-fallback";

    const title = document.createElement("span");
    title.className = "cover-title";
    title.textContent = book.title;

    const author = document.createElement("span");
    author.className = "cover-author";
    author.textContent = book.author;

    fallback.append(title, author);
    cover.append(image, fallback);

    const bookTitle = document.createElement("h4");
    bookTitle.textContent = book.title;

    const bookAuthor = document.createElement("p");
    bookAuthor.textContent = book.author;

    item.append(cover, bookTitle, bookAuthor);

    // Open book details

    item.addEventListener("click", () => {

        displayFeaturedBook(book);
        showBookDetails(book);

    });

    return item;

}


// =====================================
// SEARCH BOOKS
// =====================================

function searchBooks() {

    const query = searchInput.value.toLowerCase().trim();

    const filteredBooks = books.filter(book =>

        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.genre.toLowerCase().includes(query)

    );

    displayBooks(filteredBooks);

}


// =====================================
// CLEAR SEARCH
// =====================================

searchInput.addEventListener("input", searchBooks);

clearSearch.addEventListener("click", () => {

    searchInput.value = "";
    displayBooks(books);

});


// =====================================
// FEATURED BOOK DETAILS
// =====================================

heroDetails.addEventListener("click", () => {

    if (featuredBook) {
        showBookDetails(featuredBook);
    }

});


// =====================================
// BOOK DETAILS MODAL
// =====================================

function showBookDetails(book) {

    selectedModalBook = book;

    document.getElementById("modal-genre").textContent =
        book.genre;

    document.getElementById("modal-title").textContent =
        book.title;

    document.getElementById("modal-author").textContent =
        `By ${book.author}`;

    document.getElementById("modal-year").textContent =
        `Published in ${book.year}`;

    document.getElementById("modal-summary").textContent =
        book.summary;

    // Load local book cover

    modalCover.style.display = "none";
    modalCover.removeAttribute("src");

    modal.classList.add("show");

    const coverUrl = getBookCover(book);

    if (coverUrl) {

        modalCover.onload = () => {
            modalCover.style.display = "block";
        };

        modalCover.onerror = () => {
            modalCover.style.display = "none";
        };

        modalCover.src = coverUrl;

    }

}


// =====================================
// CLOSE MODAL
// =====================================

function hideModal() {

    modal.classList.remove("show");
    selectedModalBook = null;

}

closeModal.addEventListener("click", hideModal);

modal.addEventListener("click", event => {

    if (event.target === modal) {
        hideModal();
    }

});

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        hideModal();
    }

});


// =====================================
// START APPLICATION
// =====================================

document.addEventListener("DOMContentLoaded", loadBooks);
