//
//  Created by Milad Nazeri on 1/31/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Creates VSCode Javascript Snippets from the JSDOC output json
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

const fs = require('fs');
const path = require('path')

var vsCodeArray = [];

// load jsdoc
    var hifiDoc = require('./hifiJSDoc.json');
    // console.log("hifiDoc \n", hifiDoc);

// create VsCode mapping
    function VSCodeMappingObject(name, prefix, body, description){
        this.name = name;
        this.prefix = prefix;
        this.body = body;
        this.description = description;
    }

// {$1:ray: PickRay}
// iterate hifiDoc
    hifiDoc.forEach( item => {
        let body = ``;
        let bodyParams = [];
        item.longname = item.longname.replace(/\(0\)/g,"");
        if (item.params){
            bodyParams = item.params.map( (param, index) => {
                return `\${${index+1}:${param.name}${param.type?`\: ${param.type.names[0]}`:''}}`
            })
            body = [`${item.longname}(${`${bodyParams.join(',')}`})`];
        } else {
            body = [item.longname];
        }

        
        vsCodeArray.push(
            new VSCodeMappingObject(
                item.name,
                item.longname,
                body,
                item.description
            )
        )
    });
    // console.log("VSCodeMappingObject \n", vsCodeArray);
    

// Convert to JSON format
    function JSONConvert(VSCodeMappingObject){
        var ObjectForJSON = {};

        ObjectForJSON[VSCodeMappingObject.prefix] = {
            prefix: VSCodeMappingObject.prefix,
            body: VSCodeMappingObject.body,
            description: VSCodeMappingObject.description
        }

        return JSON.stringify(ObjectForJSON);
    }

// convert array
    var convertedArray = vsCodeArray.map(vcObject => JSONConvert(vcObject))
    // console.log("convertedArray \n", convertedArray);

// write file

    var stringToWrite = `
            [
                \t${convertedArray.join(",\n\t")}
            ]
        `
    // console.log(stringToWrite);
    
    fs.writeFileSync(path.join(__dirname, 'out', 'hifiVsCode.json'), stringToWrite);



/*
    https://code.visualstudio.com/docs/editor/userdefinedsnippets
    How VSCODE snipets are formated:

    {
        "For_Loop": {
            "prefix": "for",
            "body": [
            "for (const ${2:element} of ${1:array}) {",
            "\t$0",
            "}"
            ],
            "description": "For Loop"
        },
    }

    For Loop 
        is the snippet name.
    prefix 
        defines how this snippet is selected from 
        IntelliSense and tab completion. In this case for.
    body 
        is the content and either a single string or 
        an array of strings of which each element will be 
        inserted as separate line.
    description 
        is the description used in the IntelliSense drop down.

*/