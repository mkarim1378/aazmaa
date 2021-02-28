//=========================controllers======================
const socketioController = require('./http/controllers/socketioController');
//==========================others==========================
const helper = require('./helper/helperFunctions');
const canAccess = require('./http/middlewares/canAccess');
const checkForRoles = require('./http/middlewares/checkRoles');
//==========================configs=========================
const config = require('./config/index');
//=========================modules==========================
const expressStatusMonitor = require('express-status-monitor');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const passport = require('passport');
const flash = require('connect-flash-plus');
const EjsLayouts = require('express-ejs-layouts');
const session = require('express-session');
const ConnectMongo = require('connect-mongo')(session);
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http');
const moment = require('moment-jalaali');
const express = require('express');
const app = express();


module.exports = class Applicattion {
    constructor() {
        this.configServer();
        this.configDataBase();
        this.setConfig();
        this.setRoutes();
    }

    configServer() {
        const server = http.createServer(app);
        server.listen(config.statics.port, () => {
            console.log(`Server is running on port ${config.statics.port}`);
        });
        socketioController.main(server);

    }
    configDataBase() {
        mongoose.Promise = global.Promise;
        mongoose.connect(config.statics.connectionString, {
            auth: {
                authSource: "admin"
            },
            user: 'admin',
            pass: 'CzL6Xu724KbX565tMf5hWQ78',
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
            .then(() => console.log('connected to mongodb successfully'))
            .catch(err => console.log('could not connect to mongodb'));
    }
    setConfig() {
        moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true });

        require('./passport/passport-local');
        require('./passport/passport-google');
        //=====================settings=======================
        app.set('views', config.statics.views.viewsPath);
        app.set('view engine', config.statics.views.templateEngine);
        app.set('layout', config.statics.views.master);
        app.set('layout extractScripts', true);
        app.set('layout extractStyles', true);
        //======================using=========================

        app.use(express.static(config.statics.public));
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(cookieParser(config.statics.cookie.secret));
        app.use(session({
            secret: config.statics.session.secret,
            saveUninitialized: true,
            resave: true,
            cookie: {
                secure: false
            },
            store: new ConnectMongo({ mongooseConnection: mongoose.connection })
        }));

        app.use(flash());
        app.use(EjsLayouts);
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(morgan('dev'));

        // app.use(checkForRoles.handle);
        app.use(async (req, res, next) => {

            res.locals.auth = {
                check: req.isAuthenticated()

            }
            res.locals.helper = helper;
            res.locals.canAccess = canAccess;
            res.locals.req = req;
            res.locals.res = res;

            try {
                res.locals.currentTime = await helper.currentTime();

                res.locals.currentDate = await helper.currentDate();
                res.locals.fullTime = helper.fullTime();
            } catch (ex) {
                res.locals.currentDate = {
                    fa: moment(Date.now()).format('jYYYY/jMM/jDD'),
                    en: helper.convertPersianDigitsToEnglish(moment(Date.now()).format('jYYYY/jMM/jDD'))
                };
                res.locals.currentTime = {
                    fa: moment(Date.now()).format('HH:MM'),
                    en: helper.convertPersianDigitsToEnglish(moment(Date.now()).format('HH:MM'))
                };
            }

            if (req.user) {
                res.locals.user = req.user;
                res.locals.canClass = await canAccess.check('class')(req)
                res.locals.canExam = await canAccess.check('exam')(req)
                res.locals.canQuestion = await canAccess.check('question')(req)
                res.locals.canStudents = await canAccess.check('students')(req)
                res.locals.canAccess = await canAccess.check('access')(req)
                res.locals.canUser = await canAccess.check('user')(req)
                res.locals.canStudentClass = await canAccess.check('student-class')(req)
                res.locals.canStudentExam = await canAccess.check('student-exam')(req)
                res.locals.canAdminNotification = await canAccess.check('admin-notification')(req)

            }

            next();
        });
        app.use(cors());
    }
    setRoutes() {
        app.use(require('./routes/index'));
    }
}