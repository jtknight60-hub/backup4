const express = require('express');
const db = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// CREATE ORDER
router.post('/',
  verifyToken,
  [
    body('total').isNumeric().withMessage("Total must be numeric")
  ],
  (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const sql = "INSERT INTO orders (user_id, total) VALUES (?, ?)";

    db.query(sql, [req.user.id, req.body.total], (err, result) => {
      if (err) return res.status(500).json(err);

      res.status(201).json({ message: "Order created successfully" });
    });
});

// GET user orders
router.get('/', verifyToken, (req, res) => {
  const sql = "SELECT * FROM orders WHERE user_id = ?";

  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

module.exports = router;