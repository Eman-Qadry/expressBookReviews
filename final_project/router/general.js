const express = require('express');
let books = require("./booksdb.js");
const axios = require('axios');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

const fetchBooks = () => {
  return new Promise((resolve, reject) => {
      if (books) {
          resolve(books);
      } else {
          reject("Books not found");
      }
  });
}

// Get the book list available in the shop using async-await
public_users.get('/', async (req, res) => {
  try {
      const bookList = await fetchBooks();
      return res.status(200).json(bookList);
  } catch (error) {
      return res.status(500).json({ message: error });
  }
});
public_users.get('/promise', (req, res) => {
  fetchBooks()
      .then(bookList => {
          return res.status(200).json(bookList);
      })
      .catch(error => {
          return res.status(500).json({ message: error });
      });
});

const fetchBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
      if (books[isbn]) {
          resolve(books[isbn]);
      } else {
          reject("Book not found");
      }
  });
}

// Get book details based on ISBN using async-await
public_users.get('/isbn/:isbn', async (req, res) => {
  const { isbn } = req.params;
  try {
      const book = await fetchBookByISBN(isbn);
      return res.status(200).json(book);
  } catch (error) {
      return res.status(404).json({ message: error });
  }
});

// Get book details based on ISBN using Promise callbacks
public_users.get('/promise/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  fetchBookByISBN(isbn)
      .then(book => {
          return res.status(200).json(book);
      })
      .catch(error => {
          return res.status(404).json({ message: error });
      });
});
// Get book details based on author
public_users.get('/author/:author', (req, res) => {
    const { author } = req.params;
    const result = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());
    
    if (result.length === 0) {
        return res.status(404).json({ message: "Author not found" });
    }

    return res.status(200).json(result);
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
    const { title } = req.params;
    const result = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());

    if (result.length === 0) {
        return res.status(404).json({ message: "Title not found" });
    }

    return res.status(200).json(result);
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
    const { isbn } = req.params;
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
