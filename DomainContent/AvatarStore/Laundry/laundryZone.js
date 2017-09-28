//  laundryZone.js
//
//  Created by Rebecca Stankus on 9/25/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  This script is applied to the zone around the dynamic laundry basket to keep it from moving when an item is thrown in.
//  The script creates an edit reject filter to prevent any changes in position from being made.

function filter(p, filterType) {
    if (filterType === Entities.EDIT_FILTER_TYPE) {
        return false;
    }
}
