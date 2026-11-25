
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

const coverCache = new Map();


// =====================================
// FALLBACK COVER COLOURS
// =====================================

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
// GET REAL BOOK COVER
// =====================================

async function getBookCover(book) {

    const bookKey = String(book.id);

    if (coverCache.has(bookKey)) {
        return coverCache.get(bookKey);
    }

    try {

        const query = encodeURIComponent(
            `title:${book.title} author:${book.author}`
        );

        const response = await fetch(
            `https://openlibrary.org/search.json?q=${query}&limit=1`
        );

        if (!response.ok) return null;

        const data = await response.json();

        const coverId = data.docs?.[0]?.cover_i;

        if (coverId) {

            const coverUrl =
                `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;

            coverCache.set(bookKey, coverUrl);

            return coverUrl;
        }

    } catch (error) {

        console.log("Cover unavailable:", book.title);

    }

    coverCache.set(bookKey, null);

    return null;
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

    // Load actual cover artwork

    getBookCover(book).then(coverUrl => {

        if (coverUrl) {

            image.src = coverUrl;

            image.onload = () => {
                image.classList.add("loaded");
            };

            image.onerror = () => {
                image.removeAttribute("src");
            };
        }

    });

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

async function showBookDetails(book) {

    // Display book information

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

    // Open modal immediately

    modalCover.style.display = "none";
    modalCover.removeAttribute("src");

    modal.classList.add("show");

    // Load book cover in the background

    const coverUrl = await getBookCover(book);

    // Check whether the same book is still selected

    if (
        !modal.classList.contains("show") ||
        document.getElementById("modal-title").textContent !== book.title
    ) {
        return;
    }

    if (coverUrl) {

        modalCover.src = coverUrl;
        modalCover.style.display = "block";

        modalCover.onerror = () => {
            modalCover.style.display = "none";
        };
    }
}


// =====================================
// CLOSE MODAL
// =====================================

function hideModal() {

    modal.classList.remove("show");

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
