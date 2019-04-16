const MAX_EMOJIS = 4000;
const smallEmojiList = emojiList
    .slice(0, MAX_EMOJIS)
    .filter(emoji => {
        if (emoji.code[0].slice(0,2) === "00") {
            return false;
        }

        if (emoji.shortName.slice(0,4) === "flag") {
            return false;
        }

        return true;
    });
let emojiContainer = document.getElementById("emojiContainer");
let searchContainer = document.getElementById("searchContainer");
let selectedContainer = document.getElementById("selectedContainer");
let emojiSequenceContainer = document.getElementById("emojiSequenceContainer");
let renderJustEmojis = true;

let emojiSequence = [];

function renderEmojiList(list){
    emojiContainer.innerHTML = ""
    let listDivMap = list.map( emoji => {
        let div = document.createElement('div');
        if (renderJustEmojis){
            div.innerHTML = `
            <img class="emoji" data-number="${emoji.number}" src="./images/emojis/${emoji.code[0]}.png">
        `
        } else {
            div.innerHTML = `
            <p>
                <img class="emoji" src="./images/emojis/${emoji.code[0]}.png">
                ${emoji.number} : ${emoji.shortName} : ${emoji.keywords} : ${emoji.code}
            </p>
            
        `
        }

        return div;
    })

    listDivMap.forEach(div => {
        emojiContainer.appendChild(div);
    })
    if (renderEmojiList) {
        emojiContainer.classList.add('grid')
    }
}

function renderSelected(emoji){
    console.log("emoji:" + emoji)
    selectedContainer.innerHTML = "";
    emojiSequence.push(emoji);
    let div = document.createElement('div');
    div.innerHTML = `
        <img id="selectedEmoji" src="./images/emojis/${emoji.code[0]}.png">
        <div id="selectedText">
            ${emoji.shortName}
        </div>
    `
    selectedContainer.appendChild(div);
}

renderEmojiList(smallEmojiList);

input = document.getElementById('filter_emojis');

function filterEmojis(event){
  let keyword = input.value.toLowerCase();
  filteredEmojiList = smallEmojiList.filter(emoji => {
       return emoji.keywords.join(" ").indexOf(keyword) > -1; 
  });
  
  renderEmojiList(filteredEmojiList);
}

input.addEventListener('keyup', filterEmojis);

function renderEmojiSequence(){
    emojiSequenceContainer.innerHTML = "";
    let div = document.createElement('div');
    let imageString = "";
    emojiSequence.forEach((emoji, index) => {
        imageString += `<img class="emojiSequence" data-index="${index}" src="./images/emojis/${emoji.code[0]}.png">`
    })
    div.innerHTML = imageString;
    emojiSequenceContainer.appendChild(div);
}

function clickEmoji(event){
    let number = +event.target.getAttribute('data-number');
    if (number > 0) {
        console.log(number)
        var emoji = emojiList[number-1];
        console.log(JSON.stringify(emoji))
        renderSelected(emoji);
        renderEmojiSequence();
        EventBridge.emitWebEvent(JSON.stringify({
            app: "avimoji",
            method: "emojiSelected",
            emoji: emoji
        }))
    }

    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "emojiSelected",

    }))
}

function clickSequenceEmoji(event){
    if (event.target.getAttribute('data-index')){
        let index = +event.target.getAttribute('data-index');
        emojiSequence.splice(index, 1);
        renderEmojiSequence();
    }
}

emojiContainer.addEventListener('click', clickEmoji);

emojiSequenceContainer.addEventListener('click', clickSequenceEmoji)
/*
            ${emoji.number}:${emoji.shortName}:${emoji.code}:${emoji.keywords}

*/