const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");


public_users.post("/register", (req,res) => {
  //Write your code hereconst { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: "Username and password required."});
  if (!isValid(username)) return res.status(400).json({ message: "Invalid username format."});
  if (users.find(u => u.username === username)) return res.status(400).json({ message: "User already exists."});
  users.push({ username, password });

  return res.status(300).json({message: "User registered successfully."});
});

public_users.get('/', function (req, res) {
  let p1 = new Promise((resolve, reject) => {
    // simulate async fetch of books
    setTimeout(() => resolve(books), 100);
  });

  let p2 = (data) => new Promise((resolve) => {
    // could transform data here; we just resolve same data
    resolve(data);
  });

  p1.then((data1) => {
    // first callback
    p2(data1).then((data2) => {
      // nested callback
      return res.status(200).send(JSON.stringify(data2, null, 2));
    });
  }).catch(err => res.status(500).json({ message: "Error retrieving books" }));
});

public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  let fetchByIsbn = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (books[isbn]) resolve(books[isbn]);
      else reject(new Error("Book not found"));
    }, 100);
  });

  let formatResult = (book) => new Promise((resolve) => {
    // format or add extra info if needed
    resolve(book);
  });

  fetchByIsbn.then((book) => {
    // first callback
    formatResult(book).then((finalBook) => {
      // nested callback
      return res.status(200).send(JSON.stringify(finalBook, null, 2));
    });
  }).catch(err => res.status(404).json({ message: err.message }));
});
  
public_users.get('/author/:author', function (req, res) {
  const q = req.params.author.toLowerCase();

  let findByAuthor = new Promise((resolve) => {
    setTimeout(() => {
      const matches = Object.keys(books).reduce((acc, k) => {
        if (books[k].author && books[k].author.toLowerCase().includes(q)) acc[k] = books[k];
        return acc;
      }, {});
      resolve(matches);
    }, 100);
  });

  let finalize = (result) => new Promise((resolve) => {
    resolve(result);
  });

  findByAuthor.then((res1) => {
    finalize(res1).then((res2) => {
      if (Object.keys(res2).length === 0) return res.status(404).json({ message: "No books found for that author." });
      return res.status(200).send(JSON.stringify(res2, null, 2));
    });
  }).catch(() => res.status(500).json({ message: "Error searching by author" }));
});
public_users.get('/title/:title', function (req, res) {
  const q = req.params.title.toLowerCase();

  let findByTitle = new Promise((resolve) => {
    setTimeout(() => {
      const matches = Object.keys(books).reduce((acc, k) => {
        if (books[k].title && books[k].title.toLowerCase().includes(q)) acc[k] = books[k];
        return acc;
      }, {});
      resolve(matches);
    }, 100);
  });

  let finalize = (result) => new Promise((resolve) => {
    resolve(result);
  });

  findByTitle.then((r1) => {
    finalize(r1).then((r2) => {
      if (Object.keys(r2).length === 0) return res.status(404).json({ message: "No books found for that title." });
      return res.status(200).send(JSON.stringify(r2, null, 2));
    });
  }).catch(() => res.status(500).json({ message: "Error searching by title" }));
});
//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const book = books[req.params.isbn];
  if (!book) return res.status(300).json({ message: "Book not found" });
  return res.status(200).json(book.reviews || {});
});
module.exports.general = public_users;
