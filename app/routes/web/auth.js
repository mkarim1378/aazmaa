//=============================modules===========================
const express = require('express');
const router = express.Router();
//=========================controllers===========================
const registerController = require('../../http/controllers/auth/registerController');
const loginController = require('../../http/controllers/auth/loginController');

//============================validators=========================
const registerValidator = require('../../http/validators/registerValidator');
const loginValidator = require('../../http/validators/loginValidator');
const puppeteer = require('puppeteer');
//====================================others======================
const helper = require('../../helper/helperFunctions');

router.get('/register', (req, res, next) => {
    res.locals.layout = 'auth/register';
    next();
}, registerController.index);

router.post('/register', async (req, res, next) => {
    
    req.body.phoneNumber = helper.faDigitsToEn(req.body.phoneNumber);
    req.body.nationalCode = helper.faDigitsToEn(req.body.nationalCode);
    next();
}, registerValidator.handle(), registerController.register)
router.get('/login', (req, res, next) => {
    res.locals.layout = 'auth/login';
    
    next();
}, loginController.index);

router.post('/login', loginValidator.handle(), loginController.login);
router.get('/google', loginController.googleLogin)
router.get('/google/callback', loginController.googleLoginCalback);

module.exports = router;