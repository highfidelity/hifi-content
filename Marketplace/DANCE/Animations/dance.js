var fs = require("fs");
var dir = fs.readdirSync(__dirname);
var baseUrl = "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/";
var finalArray = dir.map(function(file){
    return baseUrl + file;
})
console.log(finalArray);