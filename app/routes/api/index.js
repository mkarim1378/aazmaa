const express = require('express');
const helper = require('./../../helper/helperFunctions');
const router = express.Router();

router.get('/currentTime', async (req, res, next) => {
    return res.json(await helper.currentTime());
});




module.exports = router;