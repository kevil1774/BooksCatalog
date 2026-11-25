
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Import book routes
const booksRoutes = require("./routes/books.routes");

// Serve public files
app.use(express.static(path.join(__dirname, "public")));

// Mount API routes
app.use("/api/books", booksRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Bookshelf server running at http://localhost:${PORT}`);
});
