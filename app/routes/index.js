const express = require('express');
const router = express.Router();

//==================routes==================
const homeRoutes = require('./web/home');
const authRoutes = require('./web/auth');
const panelRoutes = require('./web/panel');
const apiRoutes = require('./api/index');

//===============middlewares================
const authenticatedRedirect = require('../http/middlewares/authenticatedRedirect');
const isAuthenticated = require('../http/middlewares/isAuthenticated');

router.use('/api', apiRoutes);
router.use('/',  homeRoutes);
router.use('/auth', authenticatedRedirect.handle, authRoutes)
router.use('/panel', isAuthenticated.handle, panelRoutes);


module.exports = router;