Inspiration Sign
=================

This is an entity server script for use in High Fidelity that posts an inspirational quote. The script is meant to be added to the `serverScripts` property of a [Text Entity](https://docs.highfidelity.com/create-and-explore/entities/text-entities) in a High Fidelity domain.

![an inspirational sign](https://cdn.glitch.com/1188aac9-efda-4030-b0f3-3ce9aaff74f0%2Finsp.PNG?1543452496960)

### ← script.js

The bulk of this script file, which should be added to an entity under the `serverScripts` property, is to create an HTTP request to the 'They Said So' quote database provided at [https://quotes.rest/#!/qod/get_qod](https://quotes.rest/#!/qod/get_qod). This app uses the public endpoint to access the API, which returns a new quote of the day each day that we'll put onto a text entity in a High Fidelity domain. 

In the `/utils/request.js` file, we have a copy of the request module that ships with the High Fidelity application. This wraps around the `XMLHttpRequest` functionality to make a clean callback function for our API request. 

When we make an API call to the 'They Said So' service, a successful response will send us the following information in JSON format:

```
{
  "success": {
    "total": 1
  },
  "contents": {
    "quotes": [
      {
        "quote": "Your fears, your critics, your heroes, your villains: They are fictions you perceive as reality. Choose to see through them. Choose to let them go.",
        "length": "147",
        "author": "Isaac Lidsky",
        "tags": [
          "fears",
          "inspire",
          "reality"
        ],
        "category": "inspire",
        "date": "2018-11-27",
        "permalink": "https://theysaidso.com/quote/9Ei2A7a5uDzoPiF4u8FhCgeF/isaac-lidsky-your-fears-your-critics-your-heroes-your-villains-they-are-fictions",
        "title": "Inspiring Quote of the day",
        "background": "https://theysaidso.com/img/bgs/man_on_the_mountain.jpg",
        "id": "9Ei2A7a5uDzoPiF4u8FhCgeF"
      }
    ],
    "copyright": "2017-19 theysaidso.com"
  }
}
```

The two important parts of this function for our purposes are the 'quote' and the 'author'. We parse through the response JSON to get those specific values:

  `var quote = data.contents.quotes[0].quote;`
  
  `var author = data.contents.quotes[0].author;`

From there, we simply edit our entity text to reflect the combination of the quote and the author. Since the quote changes daily, we add a `Script.setInterval()` loop to check for a new quote every hour (3600 seconds).

### ← assets

This project uses built-in text entities to display the daily quote, and does not rely on any additional assets. However, you can find a copy of the Inspirational Text JSON to import the entities into your own domain inside of the glitch 'assets' directory for this project.