const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const config = require('../config/index');
const GOOGLE_CLIENT_ID = config.google.googleLogin.cliendId;
const GOOGLE_CLIENT_SECRET = config.google.googleLogin.clientSecret;
const User = require('../models/user');

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:4000/auth/google/callback',
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    
    let user = null;
    try{
        user = await User.findOne({email: profile.emails[0].value})
        console.log(user);
        if(user){
            user.googleID = profile.id;
            return done(null, user);
        }else{
            req.flash('errors', 'کاربری با این ایمیل قبلا ثبت نام نکرده است');
            return done(null, false);
        }

    }catch(ex){
        console.log(ex);
        return done(null, false);
    }
    
    
}))