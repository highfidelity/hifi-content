//
//  Created by Thijs Wenker and Milad Nazeri on 1/31/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Creates Type Script Definitions for Hifi
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


const fs = require('fs');
const path = require('path')


var parents = {};


var vsCodeArray = [];

/*
Namespace Typescript Example

declare namespace GreetingLib {
    interface LogOptions {
        verbose?: boolean;
    }
    interface AlertOptions {
        modal: boolean;
        title?: string;
        color?: string;
    }
}

declare namespace Clipboard {
    function getContentsDimensions
}
*/

let variants = [];

// load jsdoc
var hifiDoc = require('./hifiJSDoc.json');

// first add namespace
 hifiDoc.forEach(item => {
     if (item.kind && item.kind === "namespace" || item.kind === "class") {
         let parentKey = item.name;
         if (item.variation) {
             parentKey = `${parentKey}(${item.variation})`;
             variants.push({
                 name: item.name,
                 variantRegex: new RegExp(escapeRegExp(parentKey), 'g')
             });
         }
         parents[parentKey] = {
             item: item,
             members: []
         };
     }
});

// populate parents with their items
hifiDoc.forEach(item => {
    if (item.memberof) {
        if (!(item.memberof in parents)) {
            console.log(`namespace ${item.memberof} not found!`);
            return;
        }
        parents[item.memberof].members.push(item);
    }
});

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

const LINE_BREAK = "\n";
const IDENT = "    ";
const htmlreg = /(<.+?>)|(<\/.+?>)/g;
const linkreg = /(\{\@(?:link)?)([\s\S]+?)(\|[\s\S]+?)?(\})/g;

function getDescription(item, scopeDepth) {
    let descriptionBody = '';
        let ident = IDENT.repeat(scopeDepth);
    if (item.description) {
        let description = item.description
            .replace(htmlreg, "")
            .replace(linkreg, "$2")
            .replace('\r',`${LINE_BREAK}${ident} * `);
        descriptionBody += `${ident} * ${description}${LINE_BREAK}`;
        
    }    
    if (item.params){
        let bodyParams = item.params.map(param => {
            return `${ident} * @param ${param.name} {${param.type? `${param.type.names[0]}`:""}} ${param.optional? `[${param.name}=${param.defaultvalue}]`:""} ${param.description? param.description.replace('\r',`${LINE_BREAK}${ident} * `): ""}${LINE_BREAK}`
        })
        descriptionBody += bodyParams.join("");
    }
    if (item.returns) {
        descriptionBody += `${ident} * @returns {${item.returns[0].type.names[0]}} ${LINE_BREAK}`;
    }
    if (descriptionBody.length > 0) {
        // Takes care of the Vec3(0) and Quat(0) instances in the description
        variants.forEach(variant => {
            descriptionBody = descriptionBody.replace(variant.variantRegex, variant.name);
        });
        
        
        return `${ident}/**${LINE_BREAK}${descriptionBody}${ident} */${LINE_BREAK}`;
    }
    return '';
}

function getPropertyType(property) {
    if (property.type && property.type.names && property.type.names[0]) {
        return `: ${property.type.names[0]}`
    }
    return '';
}

let stringToWrite = '';
Object.keys(parents).forEach(parentKey => {
    let parent = parents[parentKey];
    let parentType = parent.item.kind;
    if (parentType === 'namespace') {
        stringToWrite += getDescription(parent.item, 0);
        stringToWrite += `declare namespace ${parent.item.name} {` + LINE_BREAK;
    } else if (parentType === 'class') {
        stringToWrite += getDescription(parent.item, 0);
        stringToWrite += `declare class ${parent.item.name} {` + LINE_BREAK;
    } else {
        console.log('Parent type is not supported');
    }
    
    parent.members.forEach(member => {
        if (member.kind === 'function') {
            stringToWrite += getDescription(member, 1);
            
            stringToWrite += IDENT; 
            // classes don't have functions but (methods)
            if (parentType === 'namespace') {
                stringToWrite += 'function ';
            }
            stringToWrite += member.name;
            
            if (member.params) {
                bodyParams = member.params.map((param, index) => {
                    return `${param.name}${param.type?`\: ${param.type.names[0]}`:''}`
                });
                stringToWrite += `(${bodyParams.join(', ')})`;
            } else {
                stringToWrite += "()";
            }
            if (member.returns && member.returns[0].type && member.returns[0].type.names) {
                stringToWrite += `: ${member.returns[0].type.names[0]}`
            } else {
                stringToWrite += ": void";
            }
            stringToWrite += `;${LINE_BREAK}`;
        } else if (member.kind === 'typedef') {
            if (member.type && member.type.names[0] === 'object') {
                let interfaceBody = "";
                
                interfaceBody += `${IDENT}interface ${member.name} {` + LINE_BREAK;
                if (member.properties) {
                    member.properties.forEach(property => {
                        interfaceBody += getDescription(property, 2) + 
                            IDENT + IDENT + property.name + getPropertyType(property) + `;${LINE_BREAK}`;
                    });
                }
                
                interfaceBody += `${IDENT}}${LINE_BREAK}${LINE_BREAK}`;
                //console.log(interfaceBody);
                stringToWrite += interfaceBody;
                
            } else { 
                console.log('unhandled typedef member name ' + member.name);
            }
        } else {
            console.log('unhandled kind ' + member.kind);
        }
    });
    
    
    if (parentType === 'namespace' && parent.item.properties) {
        parent.item.properties.forEach(property => {
            let isConst = property.name.toUpperCase() === property.name;
            stringToWrite += getDescription(property, 1) +
                IDENT + (isConst ? 'const ' : 'let ') + property.name + getPropertyType(property) + `;${LINE_BREAK}`
        });
    }
    
    stringToWrite += `}${LINE_BREAK}${LINE_BREAK}`;
});

fs.writeFileSync(path.join(__dirname, 'out', 'hifiStubs.d.ts'), stringToWrite);
