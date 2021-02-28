const express = require('express');
const router = express.Router();

//=========================controllers===============================
const homeController = require('../../http/controllers/homeController');
//=============================middlewares===========================
const isAuthenticated = require('../../http/middlewares/isAuthenticated');


router.get('/logout', (req, res, next) => {
    res.clearCookie('aazmaa_access_token');
    req.logout();
    return res.redirect('/auth/login');
});
router.get('/', isAuthenticated.handle, homeController.index);




module.exports = router;