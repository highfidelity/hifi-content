const mysql = require('mysql');

let convertTables = (tables) => {
    return tables.map( (table, index) => {
        return `CREATE TABLE IF NOT EXISTS \`${table.tableName}\` (
            ${
                Object.entries(table.schema).map( (field) => {
                    return `${field[0]} ${field[1]}`
                }).join(",")
            }
        );\n\n`
    }).join("");
}

class Database {
    constructor(dbConfig) {
        this.connection = mysql.createConnection({
            host: dbConfig.mySQLHost,
            user: dbConfig.mySQLUsername,
            password: dbConfig.mySQLPassword,
            database: dbConfig.databaseName,
            multipleStatements: true
        });
        this.createTableQuery = convertTables(dbConfig.tables);
        console.log("this.createTableQuery", this.createTableQuery)
        this.createDBQuery = `
            CREATE DATABASE IF NOT EXISTS 
            ${dbConfig.databaseName} 
            CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
    }
    query(sql) {
        return new Promise( (resolve, reject) => {
            console.log("inside promise")
            this.connection.query(sql, (err,rows) => {
                if (err){
                    return reject( err );
                }
                resolve(rows);
            });
        });
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
    maybeCreateDB() {
        console.log("in maybe create db")
        return this.query(this.createDBQuery);
    }
    maybeCreateTables() {
        console.log("made it to createtables")
        return this.query(this.createTableQuery);
    }
    maybeCreateDbAndTables() {
        console.log("in maybeCreateDbAndTables")
        return new Promise( ( resolve, reject ) => {
            this.maybeCreateDB()
            .then( () => {
                console.log("made it about to create tables")
                return this.maybeCreateTables()
            })
            .then( () => {
                return resolve();
            })
            .catch( (error ) => {
                return reject( err );
            })
        });
    }
}

module.exports = Database;
