const Controller = require('../controller');

class HomeController extends Controller {
    inedx(req, res, next){
        return res.json({
            error: req.flash('api-errors'),
            success: req.flash('api-success')
        });
    }
}


module.exports = new HomeController();