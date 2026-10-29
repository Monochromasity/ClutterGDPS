import { calcMaxListPoints, calcListPointsWithPerc, fetchlist } from "../lib.js"

async function fetchplayers() {
    try {
        const response = await fetch("/list/players.json")
        const list = await response.json();
        return list;
    } catch (error) {
        console.error(error);
    }
}

async function generateListPointLeaderboard() {
    const list = await fetchlist()
    let leaderboard = {}
    let data = {}

    for (let levelPosition in list) {
        const level = list[levelPosition]

        for (let player in level["records"]) {
            leaderboard[player] = leaderboard[player] ?? 0

            data[player] = data[player] ?? {
                hardest: +levelPosition,
                completions: [],
                records: [],
            }

            const record = level["records"][player]
            const perc = record[0]
            const listPoints = calcMaxListPoints(+levelPosition, list.length, 500)

            if (perc === 100) {
                leaderboard[player] += listPoints
                data[player].completions.push(+levelPosition)
            } else {
                leaderboard[player] += calcListPointsWithPerc(level["listperc"], perc, listPoints)
            }
            data[player].records.push([+levelPosition, perc])
        }
    }

    let sortedLeaderboard = []
    for (let player in leaderboard) sortedLeaderboard.push({
        name: player,
        points: leaderboard[player],
        hardest: data[player].hardest,
        completions: data[player].completions,
        records: data[player].records,
    })
    return sortedLeaderboard.sort((a, b) => b.points - a.points)
}

async function playerDetails(playerData, player = decodeURI(window.location.search.substring(1))) {
    const list = await fetchlist()
    const players = await fetchplayers()
    const playerInfo = players[player]
    const mainListCompletions = playerData.completions.filter((e) => e < 74).length
    const extendedListCompletions = playerData.completions.length - mainListCompletions

    const goldGradient = "margin-bottom: 5px;color: transparent;background-clip: text;background-image: linear-gradient(-22.5deg,#ebaa13 0 20%,#ebd913 40% 60%,#ebaa13 80% 100%)"
    const silverGradient = goldGradient.replaceAll("#ebaa13","#888")    .replaceAll("#ebd913", "#ddd")
    const bronzeGradient = goldGradient.replaceAll("#ebaa13","#613110") .replaceAll("#ebd913", "#9c4b13")

    const playerDiv = document.getElementById("level") // thanks jyxa

    playerDiv.style.textAlign = "center"

    const playerName = document.createElement("h1")

    switch (playerInfo.stylePreset?.name) {
        case "solid-colour":
            /*
                "data": <colour>
            */
            playerName.style.color = playerInfo.stylePreset.data
            break
        case "simple-gradient":
            /*
                "data": {
                    "dir": <gradient direction>,
                    "cols": [<gradient colours>]
                }
            */
            playerName.style.color = "transparent"
            playerName.style.backgroundClip = "text"
            playerName.style.backgroundImage = 
`linear-gradient(${playerInfo.stylePreset.data.dir ?? 0}, ${playerInfo.stylePreset.data.cols?.join(",") ?? "red, orange"})`
            break
        case "solid-colour-with-outline":
            /*
                "data": {
                    "fillCol": <fill colour>,
                    "outlineCol": <outline colour>,
                    "outlineThickness": <outline thickness>
                }
            */
            playerName.style.color = playerInfo.stylePreset.data.fillCol ?? "#000"
            playerName.style.webkitTextStroke =
                (playerInfo.stylePreset.data.outlineThickness ?? "2px") + " " + (playerInfo.stylePreset.data.outlineCol ?? "#fff")
            break
        case "solid-colour-with-shadow":
            /*
                "data": {
                    "shadowCol": <shadow colour>,
                    "blurAmount": <blur radius>,
                    "distanceX": <shadow x offset>,
                    "distanceY": <shadow y offset>
                }
            */
           playerName.style.color = playerInfo.stylePreset.data.fillCol ?? "#000"
           playerName.style.textShadow = 
`${playerInfo.stylePreset.data.shadowCol ?? "#fff"} ${playerInfo.stylePreset.data.distanceX ?? 0} ${playerInfo.stylePreset.data.distanceY ?? 0} ${playerInfo.stylePreset.data.blurAmount?? "10px"}`
           break
        default: case undefined: break
    }

    if (playerInfo.nameStyles)
        playerName.style.cssText = playerInfo.nameStyles.join(";")
    
    playerName.textContent = "#" + playerData.ranking + " | " + player
    playerName.style.display = "inline-block"
    playerName.style.fontSize = "3rem"
    playerName.style.margin = "5px 0 10px 0"
    playerDiv.appendChild(playerName)

    playerDiv.appendChild(document.createElement("br"))

    const dataDiv = document.createElement("div")
    dataDiv.className = "datadiv"

    const listPointsDiv = document.createElement("div")
    listPointsDiv.innerHTML = `
<p><b>LIST POINTS</b></p>
<h1>${playerData.points}</h1>`
    listPointsDiv.className = "dataitem"
    dataDiv.appendChild(listPointsDiv)

    const hardestDiv = document.createElement("div")
    hardestDiv.innerHTML = "<p><b>HARDEST COMPLETION</b></p>"
    const hardestHeader = document.createElement("h2")
    hardestHeader.innerHTML = `${list[playerData.hardest].level}<br>(#${playerData.hardest+1})`
    switch (playerData.hardest) {
        case 0:
            hardestHeader.style.cssText = goldGradient
            break
        case 1:
            hardestHeader.style.cssText = silverGradient
            break
        case 2:
            hardestHeader.style.cssText = bronzeGradient
            break
    }
    hardestDiv.className = "dataitem"
    hardestDiv.appendChild(hardestHeader)
    dataDiv.appendChild(hardestDiv)

    const completedDiv = document.createElement("div")
    completedDiv.className = "dataitem"
    completedDiv.innerHTML = `
<p><b>COMPLETIONS</b></p>
<h2>${mainListCompletions} MAIN<br>${extendedListCompletions} EXTENDED</h2>`
    dataDiv.appendChild(completedDiv)

    playerDiv.appendChild(dataDiv)

    const descriptionDiv = document.createElement("div")
    const hasDescription = playerInfo.description !== undefined
    descriptionDiv.className = "dataitem"
    descriptionDiv.innerHTML = `
<p>
    <b>USER DESCRIPTION</b><br><br>
    <span ${hasDescription ? '' : ' class="sad"'}>
        ${playerInfo.description.replaceAll("<a", '<a class="inline-link" target="_blank"') ?? "No description has been set yet..."}
    </span>
</p>`
    playerDiv.appendChild(descriptionDiv)

    const levelsDiv = document.createElement("div")
    levelsDiv.className = "datadiv"

    const recordsDiv = document.createElement("div")
    recordsDiv.className = "dataitem"
    recordsDiv.style.flex = "3"
    recordsDiv.style.height = "19vh"
    recordsDiv.style.overflow = "hidden auto"
    recordsDiv.innerHTML = `<p><b>RECORDS</b></p>`
    for (let record of playerData.records) {
        const recordElem = document.createElement("div")
        const level = list[+record[0]]
        recordElem.className = "item leaderboardrecord"
        recordElem.innerHTML = `
<span class="rank">#${+record[0] + 1}</span>
<span class="name" style="text-align: left">${level.level}</span>
<i style="text-align: right">${record[1]}%</i>`

        const recordLink = document.createElement("a")
        recordLink.href = "/list/?" + level.id
        recordLink.style.display = "contents"
        recordLink.style.color = "white"

        recordLink.appendChild(recordElem)
        recordsDiv.appendChild(recordLink)
    }
    levelsDiv.appendChild(recordsDiv)

    const favouriteLevelDiv = document.createElement("div")
    favouriteLevelDiv.className = "dataitem"
    favouriteLevelDiv.style.flex = "2"
    let favouriteLevel
    for (let levelIdx in list) {
        const level = list[levelIdx]
        if (level.id === playerInfo.favouriteLevel) {
            favouriteLevel = level
            favouriteLevel.ranking = levelIdx
            break
        }
    }

    let htmlContent
    if (favouriteLevel !== undefined)   htmlContent = favouriteLevel.level + "<br>(#" + (+favouriteLevel.ranking + 1) + ")"
    else                                htmlContent = `<i class="sad">None set yet...</i>`

    favouriteLevelDiv.innerHTML = `<p><b>FAVOURITE LEVEL</b></p><h2>${htmlContent}</h2>`
    levelsDiv.appendChild(favouriteLevelDiv)

    playerDiv.appendChild(levelsDiv)
}

async function fillLeaderboard() {
    const leaderboard = await generateListPointLeaderboard()
    const leaderboardDiv = document.getElementById("list")

    for (let playerIndex in leaderboard) {
        let playerData = leaderboard[playerIndex]
        playerData.ranking = +playerIndex + 1
        const player = playerData.name
        const playerDiv = document.createElement("div")
        playerDiv.id = encodeURI(player.toWellFormed())
        playerDiv.className = "item"
        playerDiv.innerHTML = `<div class="rank">#${+playerIndex+1}</div><div class="name">${player}</div>`

        if ((window.location.search === "" || window.location.search === "?") && +playerIndex === 0) {
            window.location.search = "?" + playerDiv.id
        } else if (window.location.search.substring(1) === playerDiv.id) {
            playerDiv.className = "item selected"
            playerDetails(playerData)
        }

        playerDiv.onclick = async function() {
            if (this.className !== "item selected") {
                document.getElementById(window.location.search.substring(1)).className = "item"
                this.className = "item selected"
                window.location.search = "?" + this.id;
            }
        }

        leaderboardDiv.appendChild(playerDiv)
    }
}

function updatePlayers() {
  const allLevels = document.querySelectorAll("#list > div")
  let display = "block"

  for (const level of allLevels) {
    let name
    for (const child of level.children) {
      if (child.classList.contains("name")) {
        name = child.textContent
        break
      }
    }

    if (name.toLowerCase().includes(inputContent.toLowerCase())) {
      level.style.display = "block"
      display = "none"
    } else {
      level.style.display = "none"
    }
  }
  document.getElementById("empty").style.display = display
}

let inputContent = ""
setInterval(() => {
  const newContent = document.getElementById("search").value
  if (newContent === inputContent) return // Return when the input hasn't changed

  inputContent = newContent
  updatePlayers()
}, 200)

fillLeaderboard()