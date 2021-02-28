const multer = require('multer');
const mkdirp = require('mkdirp');
const fs = require('fs');
const { get } = require('http');

function getPath(){
    let day = new Date().getDay();
    let month = new Date().getMonth();
    let year = new Date().getFullYear();
    return `./public/uploads/answer/${year}/${month}/${day}`;
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