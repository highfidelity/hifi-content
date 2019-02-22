/*

    App name
    overlayMaker.js
    Created by Milad Nazeri on 2019-02-19
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Overlay Library

*/
var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')

Script.require('./objectAssign.js');
// #TODO - property cache
// #TODO - Always clear properties
function EntityMaker(type) {
    this.properties = {};
    this.cache = {};
    this.id = null;
    this.created = null;
    this.type = type;
}

EntityMaker.prototype.add = function(props){
    if (arguments.length === 2) {
        var property = arguments[0];
        var value = arguments[1];
        props = {};
        props[property] = value;
    }
    this.properties = Object.assign({}, this.properties, props);
    this.cache = Object.assign({}, this.cache, this.properties);
    return this;
};

EntityMaker.prototype.sync = function(){
    Entities.editEntity(this.id, this.properties);
    this.properties = {};

    return this;
};

EntityMaker.prototype.edit = function(props){
    if (arguments.length === 2) {
        var property = arguments[0];
        var value = arguments[1];
        props = {};
        props[property] = value;
    }
    this.properties = Object.assign({}, this.properties, props);
    this.cache = Object.assign({}, this.cache, this.properties);
    this.sync();

    return this;
};

EntityMaker.prototype.get = function(propertyKeys, queryEntity){
    if (queryEntity && typeof propertyKeys === 'string') {
        var propertyValue = Entities.getEntityProperties(this.id, propertyKeys)[propertyKeys];
        this.properties[propertyKeys] = propertyValue;
        this.cache = Object.assign({}, this.cache, this.properties);
        return propertyValue;
    }

    if (queryEntity && Array.isArray(propertyKeys)) {
        var entityProps = Entities.getEntityProperties(this.id, propertyKeys);
        log("propertyKeys in entity maker get", propertyKeys);
        log("entityProps in entity maker get", entityProps);
        log("current entity props", this.properties);
        for (var prop in entityProps) {
            if (propertyKeys.indexOf(prop) === -1) {
                delete entityProps[prop];
            } else {
                this.properties[prop] = entityProps[prop];
            }
        }
        log("entityProps in entity maker get", entityProps)
        return entityProps;
    }

    if (Array.isArray(propertyKeys)) {
        var recombinedProps = {};
        propertyKeys.forEach(function (prop) {
            recombinedProps[prop] = this.cache[prop];
        }, this);
        return recombinedProps;
    }

    return this.cache[propertyKeys];
};

EntityMaker.prototype.show = function(){
    this.edit({ visible: true });

    return this;
};

EntityMaker.prototype.hide = function(){
    this.edit({ visible: false });
};

EntityMaker.prototype.create = function(clearPropertiesAfter){
    this.id = Entities.addEntity(this.properties, this.type);
    console.log("in create and just made", this.id);
    log("props used:", this.properties)
    if (clearPropertiesAfter) {
        this.properties = {};
    }
    return this;
};

EntityMaker.prototype.destroy = function(){
    Entities.deleteEntity(this.id);

    return this;
};

module.exports = EntityMaker;