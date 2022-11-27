const path = require('path');
module.exports = {
    botToken: '1475208126:AAEl8YREFaS-4w2AsNscDdFUq7ZN2XbhOEo',
    connectionString: 'mongodb://aazmaa-mongo/aazmaa',
    port: 4000,
    
    views: {
        viewsPath: path.resolve('./resource'),
        templateEngine: 'ejs',
        master: 'master.ejs'
    },
    public: path.resolve('./public'),
    session: {
        secret: 'secret'
    },
    cookie: {
        secret: 'secret'
    },
    jwt: {
        secret: 'secret'
    }
}