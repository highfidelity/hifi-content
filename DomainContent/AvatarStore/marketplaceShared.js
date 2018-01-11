//
//  marketplaceShared.js
//
//  This module allows you to fetch marketplace item data.
//
//  Created by Thijs Wenker on 10/10/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

var requestMarketplaceDataForID = function(marketplaceID, replyCallback) {
    Script.require('./request.js').request('https://highfidelity.com/marketplace/items/' + marketplaceID, function(error, response) {
        var replyData = {};
        var replyError = error;
        if (!error) {
            var costMatches = response.match(/<div class="item-cost[^"]*"[^>]*>[\S\s]*?<\/div>/gi);
            if (costMatches.length > 0) {
                replyData.cost = costMatches[0].replace(/(<\/?[^>]+>)/gi, '');
            } else {
                replyError = true;
            }
            var nameMatches = response.match(/<h1>[\S\s]*?<\/h1>/gi);
            if (nameMatches.length > 0) {
                replyData.name = nameMatches[0].replace(/(<\/?[^>]+>)/gi, '');
            }
            var creatorMatches = response.match(/<div.*?id="creator">.*?<span class="value">[\s\S]*?<\/div>/gi);
            if (creatorMatches.length > 0) {
                replyData.creator = creatorMatches[0].match(/<span class="value">[\s\S]*?<\/span>/gi)[0]
                    .replace(/(<\/?[^>]+>)/gi, '');
            }
        }
        replyCallback.call(this, replyError, replyData);
    });
};

module.exports = {
    requestMarketplaceDataForID: requestMarketplaceDataForID
};
