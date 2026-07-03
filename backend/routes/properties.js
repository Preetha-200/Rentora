const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        message: "Property Route Working"
    });
});

module.exports = router;