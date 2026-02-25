const express = require('express');
const db = require('../config/db');
const { body, validationResult } = require('express-validator');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

// GET all products (Public)
router.get('/', (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// GET single product
router.get('/:id', (req, res) => {
  db.query("SELECT * FROM products WHERE id = ?", 
  [req.params.id], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ message: "Product not found" });

    res.json(results[0]);
  });
});

// ADD product (Protected - Admin simulation)
router.post('/',
  verifyToken,
  [
    body('name').notEmpty(),
    body('price').isNumeric(),
    body('description').notEmpty()
  ],
  (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, price, description, image } = req.body;

    const sql = "INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)";

    db.query(sql, [name, price, description, image], (err, result) => {
      if (err) return res.status(500).json(err);

      res.status(201).json({ message: "Product added successfully" });
    });
});

module.exports = router;