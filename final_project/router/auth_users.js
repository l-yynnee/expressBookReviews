const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []; // { username, password }
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

// Validate username format (simple email pattern)
const isValid = (username) => {
  if (!username || typeof username !== 'string') return false;
  const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return re.test(username);
};

// Check matching username/password in users array
const authenticatedUser = (username, password) => {
  return users.some(u => u.username === username && u.password === password);
};

// extract username from session OR JWT token
function getUsernameFromReq(req) {
  if (req.session && req.session.username) {
    return req.session.username;
  }

  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  try {
    const payload = jwt.verify(parts[1], JWT_SECRET);
    return payload.username;
  } catch (e) {
    return null;
  }
}


regd_users.post("/register", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password)
    return res.status(400).json({ message: "Username and password required." });

  if (!isValid(username))
    return res.status(400).json({ message: "Invalid username format." });

  if (users.some(u => u.username === username))
    return res.status(409).json({ message: "User already exists." });

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully." });
});


regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password)
    return res.status(400).json({ message: "Username and password required." });

  if (!authenticatedUser(username, password))
    return res.status(401).json({ message: "Invalid credentials." });

  const userId = users.findIndex(u => u.username === username) + 1;

  // Save session authentication
  if (req.session) {
    req.session.userId = userId;
    req.session.username = username;
  }

  // Create JWT token
  const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: "2h" });

  return res.status(200).json({
    message: "Login successful",
    token
  });
});


regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review || req.body.comment || req.body.text;

  const username = getUsernameFromReq(req);
  if (!username)
    return res.status(401).json({ message: "Authentication required." });

  const book = books[isbn];
  if (!book)
    return res.status(404).json({ message: "Book not found." });

  if (!book.reviews) book.reviews = {};

  const isUpdate = !!book.reviews[username];
  book.reviews[username] = review || "";

  return res.status(200).json({
    message: `Review ${isUpdate ? 'updated' : 'added'}.`,
    isbn,
    username,
    review: book.reviews[username]
  });
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  const username = getUsernameFromReq(req);
  if (!username)
    return res.status(401).json({ message: "Authentication required." });

  const book = books[isbn];
  if (!book)
    return res.status(404).json({ message: "Book not found." });

  if (!book.reviews || !book.reviews[username])
    return res.status(404).json({ message: "No review by this user to delete." });

  delete book.reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully.",
    isbn,
    username
  });
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
