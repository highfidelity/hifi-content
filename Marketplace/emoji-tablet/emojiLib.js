///
/// emojiLib.js
/// A library of JSON links for emojis
/// 
/// Author: Elisa Lupin-Jimenez
/// Copyright High Fidelity 2017
///
/// Licensed under the Apache 2.0 License
/// See accompanying license file or http://apache.org/
///
/// All assets are under CC Attribution Non-Commerical
/// http://creativecommons.org/licenses/
///

module.exports = {

	emojiLib: {
		corn: "https://hifi-content.s3.amazonaws.com/elisalj/emoji_scripts/JSON_files/corn.json?" + Date.now(),
		flower: "https://hifi-content.s3.amazonaws.com/elisalj/emoji_scripts/JSON_files/flower.json?" + Date.now(),
		heart: "https://hifi-content.s3.amazonaws.com/elisalj/emoji_scripts/JSON_files/heart.json?" + Date.now(),
		monster: "https://hifi-content.s3.amazonaws.com/elisalj/emoji_scripts/JSON_files/monster.json?" + Date.now(),
		pickle: "https://hifi-content.s3.amazonaws.com/elisalj/emoji_scripts/JSON_files/pickle.json?" + Date.now(),
		pizza: "https://hifi-content.s3.amazonaws.com/elisalj/emoji_scripts/JSON_files/pizza.json?" + Date.now(),
		poo: "https://hifi-content.s3.amazonaws.com/elisalj/emoji_scripts/JSON_files/poo.json?" + Date.now()
	},

	getEmoji: function(name, library) {
		print("Emoji to retrieve: " + name);
		if (name in library) {
			return library[name];
		} else {
			print("Unable to locate emoji");
			return null;
		}
	}

};