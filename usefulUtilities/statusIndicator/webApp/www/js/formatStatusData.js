var UNSET_DISPLAY_NAME_STRING = "unset display name";
var UNKNOWN_TEAM_STRING = "Unknown Team";

function formatStatusData(data) {
    var generatedContainerDiv = document.createElement("div");

    var unknownTeamContainer;

    for (var i = 0; i < data.teams.length; i++) {
        var currentTeamName = data.teams[i].name;
        if (currentTeamName === "TBD") {
            currentTeamName = UNKNOWN_TEAM_STRING;
        }

        var teamContainer = document.createElement("div");

        var teamTable = document.createElement("table");

        var tbody = document.createElement('tbody');
        var onlineCount = 0;
        var totalCount = data.teams[i].members.length;
        for (var j = 0; j < totalCount; j++) {
            var tr = document.createElement('tr');

            var currentDisplayName = data.teams[i].members[j].displayName;
            currentDisplayName = currentDisplayName === "NULL" ? UNSET_DISPLAY_NAME_STRING : currentDisplayName;
            var currentStatus = data.teams[i].members[j].status;
            var currentLocation = data.teams[i].members[j].location;

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
            tr.appendChild(td);

            var td = document.createElement('td');
            td.appendChild(document.createTextNode(currentDisplayName));
            if (currentStatus === "offline") {
                td.classList.add("offlineDisplayNameText");
            }
            if (currentDisplayName === UNSET_DISPLAY_NAME_STRING) {
                td.classList.add("unknownDisplayNameText");
            }
            td.classList.add("displayName");
            tr.appendChild(td);

            td = document.createElement('td');
            if (currentStatus === "offline") {
                currentLocation = "offline";
                td.classList.add("offlineStatusText");
            }
            if (currentLocation !== "hidden") {
                td.appendChild(document.createTextNode(currentLocation));
            }
            tr.appendChild(td);

            tbody.appendChild(tr);

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
        h2.innerHTML = `${currentTeamName} (${onlineCount}/${totalCount})`;
        teamContainer.appendChild(h2);

        teamTable.appendChild(tbody);
        teamContainer.appendChild(teamTable);

        if (currentTeamName === "Unknown Team") {
            unknownTeamContainer = teamContainer;
        } else {
            generatedContainerDiv.appendChild(teamContainer);
        }
    }

    if (unknownTeamContainer) {
        generatedContainerDiv.appendChild(unknownTeamContainer);
    }

    document.getElementById("content").innerHTML = generatedContainerDiv.innerHTML;
}