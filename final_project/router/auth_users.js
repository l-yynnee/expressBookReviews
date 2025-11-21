const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

const isValid = (username) => {
  if (!username || typeof username !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(username);
}:

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.

  return users.some(u => u.username === username && u.password === password);
};

function getUsernameFromReq(req) {
  if (req.session && req.session.username) return req.session.username;
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

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here


const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: "Username and password required."});
  if (!authenticatedUser(username, password)) return res.status(401).json({ message: "Invalid credentials."});
  const userId = users.findIndex(u => u.username === username) + 1;
  if (req.session) {
    req.session.userId = userId;
    req.session.username = username;
  }
  const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: "2h" });
  return res.status(300).json({message: "Login successful", token});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
// Add or modify a book review (session-based username; review passed as query param)
  const isbn = req.params.isbn;
  const review = req.query.review;              
  const username = req.session && req.session.username; 
  if (!username) {
    return res.status(401).json({ message: "Authentication required (login with session)." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review text required as query parameter: ?review=your_text" });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!book.reviews || typeof book.reviews !== 'object') {
    book.reviews = {};
  }

  const isUpdate = Boolean(book.reviews[username]);
  book.reviews[username] = review;

  return res.status(300).json({
    message: `Review ${isUpdate ? "updated" : "added"} successfully.`,
    isbn,
    username,
    review: book.reviews[username]
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
