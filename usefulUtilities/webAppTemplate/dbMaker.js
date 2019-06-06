const Database = require('./dbClass.js');
const dbInfo = require("./dbInfo.json");
const baseConfig = {
    host: dbInfo.config.mySQLHost,
    user: dbInfo.config.mySQLUsername,
    password: dbInfo.config.mySQLPassword,
};

// Grab the tables from the config file and dynamically make the query
let createTables = (tables) => {
    return tables.map((table, index) => {
        return `CREATE TABLE IF NOT EXISTS \`${table.tableName}\` (
            ${
                Object.entries(table.schema).map((field) => {
                    return `${field[0]} ${field[1]}`
                }).join(",")
            }
        );\n\n`
    }).join("");
};

class DbMaker {
    constructor(){
        this.createTableQuery = createTables(dbInfo.tables);
        this.createDBQuery = `
            CREATE DATABASE IF NOT EXISTS 
            ${dbInfo.config.databaseName} 
            CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
    }
    maybeCreateDB() {
        return Database.execute(baseConfig,
            database => database.query(this.createDBQuery));
    }
    maybeCreateTables() {
        const extendedConfig = Object.assign({}, baseConfig, {
            database: dbInfo.config.databaseName,
            multipleStatements: dbInfo.config.multipleStatements
        })

        return Database.execute(extendedConfig, 
            database => database.query(this.createTableQuery));
    }
    maybeCreateDbAndTables() {
        return new Promise((resolve, reject) => {
            this.maybeCreateDB()
            .then(() => {
                return this.maybeCreateTables()
            })
            .then(() => {
                return resolve();
            })
            .catch((error) => {
                return reject(error);
            })
        });
    }
}

module.exports = DbMaker;