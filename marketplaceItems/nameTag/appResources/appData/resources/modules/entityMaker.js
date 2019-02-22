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

function EntityMaker(type) {
    this.properties = {};
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

    return this;
};

EntityMaker.prototype.sync = function(){
    Entities.editEntity(this.id, this.properties);

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
    this.sync();

    return this;
};

EntityMaker.prototype.get = function(key){
    return this.properties[key];
};

EntityMaker.prototype.show = function(){
    this.edit({ visible: true });

    return this;
};

EntityMaker.prototype.hide = function(){
    this.edit({ visible: false });
};

EntityMaker.prototype.create = function(){
    this.id = Entities.addEntity(this.properties, this.type);
    console.log("in create and just made", this.id);
    log("props used:", this.properties)
    return this;
};

EntityMaker.prototype.destroy = function(){
    Entities.deleteEntity(this.id);

    return this;
};

module.exports = EntityMaker;