const fs = require("fs");
const input = "./emojiList.html";
const output = "./emojiList.js";

// Keep these range sets
const ranges = [

]

// Make the actual emoji object
function Emoji_Object(number, code, shortName, keywords){
    this.number = number;
    this.code = code;
    this.shortName = shortName;
    this.keywords = keywords;
}


// Break apart each row and make the actual emoji object
const rowReplaceRegex = /<\/td>|class=".*?>|<\/a>|<a.*?">|class=".*?>|<span |<\/span>|U\+/g;
function splitTr(row){
    row = row
        .replace(rowReplaceRegex, "")
        .split("<td ")
        .filter(item => !!item);

    row[1] = row[1]
        .split(" ");

    row[3] = row[3]
        .split("|")
        .map(item => item.trim());

    return new Emoji_Object(row[0], row[1], row[2], row[3]);
}

const replaceRegex = /(<img .*?>)|(<th.*?\/th>)|<\/tr>|\n/g
const file = JSON.stringify(
    fs
        .readFileSync(input, 'utf8') // read the file
        .replace(replaceRegex, "") // replace general junk
        .split('<tr>') // split on each row
        .slice(1, -1) // remove what is before the first and after the last rows
        .filter(item => !!item) // remove empty indexes
        .map(row => splitTr(row)) // map the rows to convert them to emoji objects 
)

let finalString = `var emojiList = ${file};`

fs.writeFileSync(output, finalString);
