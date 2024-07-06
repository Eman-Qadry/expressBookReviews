const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Implement your logic to check if the username is valid
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    // Implement your logic to check if the username and password match
    return users.some(user => user.username === username && user.password === password);
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ username }, "your_secret_key", { expiresIn: "2h" });
    req.session.token = token;

    return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { review } = req.body;
    const { isbn } = req.params;

    if (!req.session.token) {
        return res.status(403).json({ message: "User not authenticated" });
    }

    const decoded = jwt.verify(req.session.token, "your_secret_key");
    const username = decoded.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added successfully", book: books[isbn] });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
