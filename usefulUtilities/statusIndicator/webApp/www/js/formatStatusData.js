var UNSET_DISPLAY_NAME_STRING = "unset display name";
var UNKNOWN_LOCATION_STRING = "online";

function formatStatusData(data) {
    var generatedContainerDiv = document.createElement("div");
    if (data.people.length === 0) {
        document.getElementById("content").innerHTML = `<h2>There's no status data available for the specified organization.</h2>`;
        return;
    }

    var peopleContainer = document.createElement("div");

    var peopleTable = document.createElement("table");

    var tbody = document.createElement('tbody');
    var onlineCount = 0;
    var totalCount = data.people.length;
    for (var i = 0; i < totalCount; i++) {
        var tr = document.createElement('tr');

        var currentDisplayName = data.people[i].displayName;
        currentDisplayName = currentDisplayName === "NULL" ? UNSET_DISPLAY_NAME_STRING : currentDisplayName;
        var currentStatus = data.people[i].status;
        var currentLocation = data.people[i].location;

        var td = document.createElement('td');
        var inner = document.createElement('div');
        var outer = document.createElement('div');
        if (currentStatus === "offline") {
            outer.classList.add("offlineIndicatorOuter");
        } else if (currentStatus === "busy") {
            inner.classList.add("busyIndicator");
            outer.classList.add("busyIndicatorOuter");
        } else if (currentStatus === "available") {
            inner.classList.add("availableIndicator");
            outer.classList.add("availableIndicatorOuter");
        } else {
            inner.classList.add("customIndicator");
            outer.classList.add("customIndicatorOuter");
        }
        outer.appendChild(inner);
        td.appendChild(outer);
        // Keep the table data around in case we want to change this later - but for now,
        // don't show anyone in the frontend who's marked as offline.
        if (currentStatus !== "offline") {
            tr.appendChild(td);
        }

        var td = document.createElement('td');
        td.appendChild(document.createTextNode(currentDisplayName));
        if (currentStatus === "offline") {
            td.classList.add("offlineDisplayNameText");
        }
        if (currentDisplayName === UNSET_DISPLAY_NAME_STRING) {
            td.classList.add("unknownDisplayNameText");
        }
        td.classList.add("displayName");
        // Keep the table data around in case we want to change this later - but for now,
        // don't show anyone in the frontend who's marked as offline.
        if (currentStatus !== "offline") {
            tr.appendChild(td);
        }

        td = document.createElement('td');
        if (currentStatus === "offline") {
            currentLocation = "offline";
            td.classList.add("offlineStatusText");
        }
        if (currentStatus !== "offline" && currentLocation === "unknown") {
            currentLocation = UNKNOWN_LOCATION_STRING;
        }
        if (currentLocation !== "hidden") {
            td.appendChild(document.createTextNode(currentLocation));
        }
        // Keep the table data around in case we want to change this later - but for now,
        // don't show anyone in the frontend who's marked as offline.
        if (currentStatus !== "offline") {
            tr.appendChild(td);
        }

        // Keep the table data around in case we want to change this later - but for now,
        // don't show anyone in the frontend who's marked as offline.
        if (currentStatus !== "offline") {
            tbody.appendChild(tr);
        }

        if (!(currentStatus === "offline" || currentStatus === "busy" || currentStatus === "available")) {
            tr = document.createElement('tr');
            tr.classList.add("statusRow");

            td = document.createElement('td');
            td.appendChild(document.createTextNode(""));
            tr.appendChild(td);

            td = document.createElement('td');
            td.setAttribute("colspan", 2);
            td.appendChild(document.createTextNode(currentStatus));
            tr.appendChild(td);

            tbody.appendChild(tr);
        }

        if (currentStatus !== "offline") {
            onlineCount++;
        }
    }

    var h2 = document.createElement("h2");
    h2.innerHTML = `People (${onlineCount} Online)`;
    peopleContainer.appendChild(h2);

    peopleTable.appendChild(tbody);
    peopleContainer.appendChild(peopleTable);

    generatedContainerDiv.appendChild(peopleContainer);

    document.getElementById("content").innerHTML = generatedContainerDiv.innerHTML;
}