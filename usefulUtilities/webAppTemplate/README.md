# Description

An express template for web apps.  

# Instructions

```
You will create two config files.  A config JSON for the server with the following fields:
{
    "PORT": <Port Number>,
    "API_ROUTER": "<./pathToYourRoutingFile.j>",
    "API_PATH": "</endpointAPI/path>"
}
```

as well as a path for your database setup
Note: Make sure to set multipleStatements to true if you have more than one table you are making.
 
```
{
    "config": {
        "mySQLHost": "<Hostname of the MySQL server>",
        "mySQLUsername": "<Username you'll use to connect to the MySQL server>",
        "mySQLPassword": "<Password you'll use to connect to the MySQL server>",
        "databaseName": "<Name of the DB you'll use for this webapp>"
        "multipleStatements": <true/false depending on if you have multiple tables below to setup>
    },
    "tables": [
        {
            "tableName": "table1",
            "schema": {
                "field1": "VARCHAR(100) PRIMARY KEY",
                "field2": "VARCHAR(100)"
            }
        },
        {
            "tableName": "table2",
            "schema": {
                "field1": "VARCHAR(100) PRIMARY KEY",
                "field2": "VARCHAR(100)"
            }
        }
    ]
}
```

Customize the files to fit your needs, but generally should only have to work in the router file. 
Examples of how to use it are included for get/post/delete methods. 

# Change Log

## V1.0 | Initial Version | 8e14caa
