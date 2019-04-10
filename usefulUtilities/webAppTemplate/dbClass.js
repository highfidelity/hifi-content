// Wrapper for DB calls

const mysql = require('mysql');

class Database {
    constructor(dbConfig) {
        this.connection = mysql.createConnection(dbConfig);
    }
    query(sql) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, (err,rows) => {
                if (err){
                    console.log('err', err)
                    return reject( err );
                }
                resolve(rows);
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            } );
        } );
    }
}

Database.execute = (config, callback) => {
    const database = new Database(config);
    return callback(database).then(
        result => database.close().then(() => result ),
        err => database.close().then(() => { throw err; } )
    );
};

module.exports = Database;
