const express = require('express');
const router = express.Router();
const path = require('path');

router.get('^/$|/index(.html)?', (req, res) => {
    res.status(404).json({ "error": "404 Not Found" });
});

module.exports = router;