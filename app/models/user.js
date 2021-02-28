const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/index');
const ObjectId = mongoose.Types.ObjectId;

const UserSchema = new mongoose.Schema({
    name: {type: String, default: ''},
    family: {type: String, default: ''},
    nationalCode: {type: String, default: ''},
    email: {type: String, default: ''},
    password: {type: String, default: ''},
    phoneNumber:{type: String, default: ''},
    teacher: {type: ObjectId, ref: 'User'},
    type: {type: String, default: ''},
    isAdmin: {type: Boolean, default: false},
    chatId: {type: String, default: ''},
    googleId: {type: String, default: ''},
    profile: {type: String, default: ''},
    role: [{type: ObjectId, ref: 'Role', required: true}],
    
}, {
    toJSON: {virtuals: true},
    timestamps: true
});

UserSchema.pre('save', function (next) { 
    if(this.password && this.password != ''){
        let salt = bcrypt.genSaltSync(15);
        let hash = bcrypt.hashSync(this.password, salt);
        this.password = hash;
    }
    next();
});

UserSchema.methods.comparePassword = function (password) { 
    return bcrypt.compare(password, this.password);
}

UserSchema.methods.setToken = function(res){
    let token = jwt.sign({_id: this._id}, config.statics.jwt.secret);
    let a = res.cookie('aazmaa_access_token', token, {maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true, signed   : true})
    

}
UserSchema.methods.verifyToken = function(token){
    let user = jwt.verify(token, config.statics.jwt.secret);
    return this._id == user._id;
        
}
UserSchema.virtual('answers', {
    ref: 'Answer',
    localField: '_id',
    foreignField: 'student'
});
module.exports = mongoose.model('User', UserSchema);