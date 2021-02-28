const autoBind = require('auto-bind');
const { validationResult } = require('express-validator');

module.exports = class Controller {
    constructor() {
        autoBind(this);
    }

    validateForm(req) {
        return new Promise(async (resolve, reject) => {
            let result = validationResult(req);
            if (!result.isEmpty()) {
                
                let array = result.array();
                let errors = [];
                array.forEach(error => {
                    errors.push(error.msg);
                });
                req.flash('errors', errors);
                resolve(false);
            }else{
                resolve(true);
            }
        });
    }
    
    back(req, res){
        if(req.body.referer){
            res.redirect(req.body.referer)
        }else{
            res.redirect(req.header('Referer') || '/');
        }
        
    }
}