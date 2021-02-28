const multer = require('multer');
const mkdirp = require('mkdirp');
const fs = require('fs');

function getPath(){
    let year = new Date().getFullYear();
    let month = new Date().getMonth();
    let day = new Date().getDay();
    return `./public/uploads/practice/${year}/${month}/${day}`;
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        if(!fs.existsSync(getPath())){
            mkdirp(getPath())
            .then(() => {
                callback(null, getPath());    
            });
        }else{
            callback(null, getPath());
        }
    },
    filename: (req, file, callback) => {
        let filename = file.originalname;
        if(fs.existsSync(`${getPath()}/${filename}`)){
            filename = `${Date.now()}-${filename}`;
        }
        callback(null, filename);
    }
});


module.exports = multer({storage: storage, limits: {fieldSize: 2 * 1024 * 1024}});