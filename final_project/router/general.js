const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code hereconst { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: "Username and password required."});
  if (!isValid(username)) return res.status(400).json({ message: "Invalid username format."});
  if (users.find(u => u.username === username)) return res.status(400).json({ message: "User already exists."});
  users.push({ username, password });

  return res.status(300).json({message: "User registered successfully."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here 
return res.status(200).send(JSON.stringify(books, null, 2));

  return res.status(300).json({message: "Books retrieved successfully"});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).send(JSON.stringify(book, null, 2));
    } else {
	return res.status(300).json({message: "Book not found"});
 }});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
const authorQuery = req.params.author.toLowerCase();
  const results = {};
  Object.keys(books).forEach(isbn => {
    if (books[isbn].author && books[isbn].author.toLowerCase().includes(authorQuery)) results[isbn] = books[isbn];
  });
  if (Object.keys(results).length === 0) 
  return res.status(300).json({message: "No books found for that author"});
 return res.status(200).send(JSON.stringify(results, null, 2));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
const titleQuery = req.params.title.toLowerCase();
  const results = {};
  Object.keys(books).forEach(isbn => {
    if (books[isbn].title && books[isbn].title.toLowerCase().includes(titleQuery)) results[isbn] = books[isbn];
  });
  if (Object.keys(results).length === 0)
 return res.status(300).json({ message: "No books found for that title."});
  return res.status(200).send(JSON.stringify(results, null, 2));
});	
  
//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const book = books[req.params.isbn];
  if (!book) return res.status(300).json({ message: "Book not found" });
  return res.status(200).json(book.reviews || {});
});
module.exports.general = public_users;
