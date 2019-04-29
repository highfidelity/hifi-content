const fs = require("fs");
const path = require('path');
const sizeOf = require("image-size");

const input = "./emojiList.html";
const output = "./emojiList.json";

// The source file directory for the svgs(later turned to pngs for the in-world imags)
const sourceSVG = path.join(__dirname, "../images/emojis/svg-original");
// The directory to copy the filtered svgs to
// The reason for this is that making the spritesheets can be difficult and to help
// in the creation process, we are making a pre-filter so that we can just drop in a directory
// and remove any svgs we don't like already
const filterdSVGPath = path.join(__dirname, "images/emojis2/svgFiltered");

// The main directory for the sprite sheets
const inDIR = path.join(__dirname, "../images/emojis");

// if we have already made a filtered list, then grab it
let originalFilteredIDS = fs.readFileSync(path.join(__dirname, "filterdIDList.json"), "utf-8");

// Check to see
const SHOULD_CHECK_FOR_COMBINED = true;
const SHOULD_UPDATE_SVG_FILES = false;

let filteredJSONS = [];
let combinedSprite = {};

function JSONConstructor(file, number, type){
    this.file = file;
    this.number = number;
    this.type = type;
    this.source = file.replace(".json", ".png");
}


// there isn't a way to delete a folder with files in Node, so delete all files
// then delete the directory
function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function(file, index){
        var curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
            deleteFolderRecursive(curPath);
        } else { // delete file
            fs.unlinkSync(curPath);
        }
        });
        fs.rmdirSync(path);
    }
}


// if this flag is set to true, then we copy over the svg files
// that aren't filtered
if (SHOULD_UPDATE_SVG_FILES) {
    if (fs.existsSync(filterdSVGPath)){
        console.log("deleting");
        deleteFolderRecursive(filterdSVGPath)
    }
    fs.mkdirSync(filterdSVGPath);
    let svgFiles = fs.readdirSync(sourceSVG);
    svgFiles.forEach(file => {
        let extension = path.extname(file);
        if (originalFilteredIDS.indexOf(path.basename(file, extension)) === -1){
            let filePath = path.join(sourceSVG, file);
            let toPath = path.join(filterdSVGPath, file);
            fs.copyFileSync(filePath, toPath);
        }
    })
}


// if this is true, mainly because we have rendered new sprite sheets, then we are go back through the sprite sheets
// and make a combined map of all of them.
if (SHOULD_CHECK_FOR_COMBINED) {
    // Look in the emojis directory and get all the svg jsons
    fs.readdirSync(inDIR).forEach(file => {
        if (path.extname(file) === ".json" && file.substring(0, 3) === "svg"){
            filteredJSONS.push(file);
        }
    });
    
    
    filteredJSONS = filteredJSONS.map(file => {
        let split = file.split("-");
        return new JSONConstructor(file, split[1], split[2].split(".")[0]);
    })
    
    
    filteredJSONS.forEach(json => {
        let file = JSON.parse(fs.readFileSync(path.join(inDIR,json.file), 'utf-8'));
        let number = json.number;
        let type = json.type;
        let source = json.source;
        for (var emojiKey in file.frames) {
            if (!combinedSprite[emojiKey]) {
                combinedSprite[emojiKey] = {};
            }
    
            if (!combinedSprite[emojiKey][type]) {
                combinedSprite[emojiKey][type] = {};
            }
            
            let dimensions = sizeOf(path.join(inDIR, json.file.replace(".json", ".png")));
            combinedSprite[emojiKey][type].source = source;
            combinedSprite[emojiKey][type].sourceDimensions = { x: dimensions.width, y: dimensions.height };
            combinedSprite[emojiKey][type].frame = file.frames[emojiKey].frame;
        }
    })
}


// Make the actual emoji object
function Emoji_Object(number, code, shortName, keywords, mainCateogry, subCategory){
    this.number = number;
    this.code = code;
    this.shortName = shortName;
    this.keywords = keywords;
    this.mainCategory = mainCateogry;
    this.subCategory = subCategory;
}


const rowReplaceRegex = /<\/td>|class=".*?>|<\/a>|<a.*?">|<span |<\/span>|U\+|⊛ /g;
const headerRegex = /colspan/;
const headreg = /hair-style/g;
const replaceHeader = /<th colspan="5" class=".*?">|<a.*?>|<\/a><\/th>/g
let mainCategory = "";
let subCategory = ""
let lastIndexHeader = null;
let tempHeader1 = 0;

let count = 0;
function splitTr(row, index){
    
    if (headerRegex.test(row)) {
        count++;
        row = row
            .replace(replaceHeader, "")
            .replace("&amp;", "&");
        if (lastIndexHeader === null){
            lastIndexHeader = index;
        } else {
            if (index !== lastIndexHeader + 1) {
                subCategory = row;
            } else {
                mainCategory = tempHeader1;
                subCategory = row;
            }
            lastIndexHeader = index;
        }
        tempHeader1 = row;
        return
    }

    row = row
        .replace(rowReplaceRegex, "")
        .split("<td ")
        .filter(item => !!item);

    row[1] = row[1]
        .split(" ")
        .map(item => item.toLowerCase());

    row[3] = row[3]
        .split("|")
        .map(item => item.trim());

    return new Emoji_Object(row[0], row[1], row[2], row[3], mainCategory, subCategory);
}



var filterRegex = /(m[ae]n )|(wom[ae]n )/;
let filteredIDS = new Set();
var count00 = 0;
var countflag = 0;
var countRegex = 0;
var countNotInCombined = 0;
function finalFilter(emoji, index, array){
    if (!emoji) {
        count++;
        return false;
    }

    if (emoji.code[0].slice(0, 2) === "00") {
        filteredIDS.add(emoji.code[0]);
        count00++;
        return false;
    }

    if (emoji.shortName.slice(0, 4) === "flag") {
        filteredIDS.add(emoji.code[0]);
        countflag++
        return false;
    }

    if (filterRegex.test(emoji.shortName)) {
        filteredIDS.add(emoji.code[0]);
        countRegex++;
        return false;
    }

    if (SHOULD_CHECK_FOR_COMBINED) {
        if (combinedSprite[emoji.code[0]]) {
            emoji.frame = combinedSprite[emoji.code[0]].frame;
            emoji.small = combinedSprite[emoji.code[0]].small;
            emoji.normal = combinedSprite[emoji.code[0]].normal;
            emoji.large = combinedSprite[emoji.code[0]].large;
            emoji.massive = combinedSprite[emoji.code[0]].massive;
            emoji.biggest = combinedSprite[emoji.code[0]].biggest;
        } else {
            filteredIDS.add(emoji.code[0]);
            countNotInCombined++
            return false;
        }
    }

    return true;
}


const replaceRegex = /(<img .*?>)|(<th class.*?\/th>)|<th>.*?<\/th>|<\/tr>|\n/g
let file =
    fs
        .readFileSync(input, 'utf8') // read the file
        .replace(replaceRegex, "") // replace general junk
        .split('<tr>') // split on each row
        .slice(1, -1) // remove what is before the first and after the last rows
        .filter(item => !!item) // remove empty indexes
        .map((row, index) => splitTr(row, index)) // map the rows to convert them to emoji objects
        .filter(finalFilter);
console.log("count", count);
file = JSON.stringify(file, null, 4)

function difference(setA, setB) {
    var _difference = new Set(setA);
    for (var elem of setB) {
        _difference.delete(elem);
    }
    return _difference;
}

fs.writeFileSync(output, file);
if (SHOULD_CHECK_FOR_COMBINED){
    originalFilteredIDSSet = new Set(JSON.parse(originalFilteredIDS));
    let setDifference = [...difference(originalFilteredIDSSet, filteredIDS)];
    console.log("setDifference", [...setDifference]);
    if (setDifference.length){
        console.log("different filter, writing list");
    }
}