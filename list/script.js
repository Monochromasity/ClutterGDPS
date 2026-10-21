async function fetchlist() {
  try {
    const response = await fetch("/list/list.json")
    const list = await response.json();
    return list;
  } catch (error) {
    console.error(error);
  }
}
async function leveldetails(inputlevel) {
  // Get level div
  const leveldiv = document.getElementById("level");

  // Level name in level div
  const levelname = document.createElement("div");
  levelname.textContent = inputlevel["level"]
  levelname.className = "levelname";
  leveldiv.appendChild(levelname);

  // Lower div
  const lowerdiv = document.createElement("div");
  lowerdiv.className = "lowerdiv";

  // Details div
  const detailsdiv = document.createElement("div");
  detailsdiv.className = "detailsdiv";

  // Records div
  const recordsdiv = document.createElement("div");
  recordsdiv.className = "recordsdiv";

  // Level creators, publisher, and verifier
  const cpv = document.createElement("div");
  cpv.innerHTML = `
Created by <b>${inputlevel["creators"]}</b>,
published by <b>${inputlevel["publisher"]}</b>,
verified by <b>${inputlevel["verifier"]}</b>`
  cpv.className = "cpvlabel";
  detailsdiv.appendChild(cpv);

  // Level description
  const desc = document.createElement("div");
  desc.textContent = inputlevel["description"] ?? "No description was provided for this level yet."
  desc.className = "desc";
  detailsdiv.appendChild(desc);

  // Video iframe
  // <iframe width="560" height="315" src="https://www.youtube.com/embed/MM7zFyFqD8A?si=JmUGHUIf9_PccYe0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
  if (inputlevel["video"] != undefined) {
    const video = document.createElement("iframe");
    //video.width = "560";
    //video.height = "315";
    video.src = "https://www.youtube.com/embed/" + inputlevel["video"];
    video.className = "video";
    recordsdiv.appendChild(video);
  } else {
    const video = document.createElement("div");
    video.textContent = "No video was found for this level."
    video.className = "video";
    recordsdiv.appendChild(video);
  }
  // Records
  const recsparent = document.createElement("div")
  const recsdiv = document.createElement("div");
  const records = inputlevel["records"]
  recsdiv.className = "list";
  recsdiv.id = "records-list"
  const recsheader = document.createElement("h2")
  recsheader.innerHTML = "<u>Records</u>"
  recsheader.style.textAlign = "center"
  recsheader.style.marginBottom = "5px"
  recsparent.appendChild(recsheader)

  if (Object.keys(records).length > 0) {
    for (const key in records) {
      const userdiv = document.createElement("div");
      const percdiv = document.createElement("div");
      userdiv.className = "recuser";
      userdiv.textContent = key
      percdiv.className = "recperc";
      percdiv.textContent = records[key][0] + "%"

      let vid = document.createElement("a")
      const link = records[key][1]
      vid.className = "inline-link"
      let href
      // Jyxa, this isn't vibecoded, it's called documentation
      switch (records[key][2]) {
        case "yt": // YouTube
          // Example: "0ET_fARhNeQ"
          href = "https://youtube.com/watch?v=" + link
          break

        case "catbox": // Catbox
          // Example: "d6i9mv.mp4"
          href = "https://files.catbox.moe/" + link
          break

        case "vimeo": // Vimeo
          // Example: "722256136"
          href = "https://vimeo.com/" + link
          break

        case "medal": // Medal.tv
          // Example: ["bluestacks", "nKHHEgcVxJsgW58OC"]
          href = "https://medal.tv/games/" + link[0] + "/clips/" + link[1]
          break

        case "url":
        default: // Raw url
          // Example: "https://goob.club"
          href = link
          break
        
        case "verifier":
          // Record belongs to the verifier of the level.
          vid = document.createElement("i")
          vid.className = "sad"
          vid.textContent = "Verifier"
          vid.style.textAlign = "left"
          break
      }
      if (records[key][2] !== "verifier") {
          vid.href = href
          vid.target = "_blank"
          vid.textContent = "Watch"
      }

      const recdiv = document.createElement("div");

      recdiv.appendChild(userdiv);
      recdiv.appendChild(percdiv);
      recdiv.appendChild(vid)
      recdiv.className = "item record";
      recsdiv.appendChild(recdiv);
    }
  } else {
    recsdiv.innerHTML += `<i class="sad">No records yet...</i>`
    recsdiv.style.textAlign = "center"
  }
  recordsdiv.appendChild(recsparent);
  recsparent.appendChild(recsdiv)
  
  lowerdiv.appendChild(detailsdiv);
  lowerdiv.appendChild(recordsdiv);
  leveldiv.appendChild(lowerdiv);
}

async function printlist() {
  const list = await fetchlist();
  const htmllist = document.getElementById("list");
  allids = [];
  for (i = 0; i < list.length; i++) {
    allids.push(list[i]["id"]);
  }
  itemparam = parseInt(window.location.search.substring(1));
  for (i = 0; i < list.length; i++) {
  
    // Level div
    const item = document.createElement("div");
    if (window.location.search != "" && window.location.search != "?") {
      if (list[i]["id"] == itemparam) {
        item.className = "item selected";
      } else if (allids.includes(itemparam)) {
        item.className = "item";
      } else if (i == 0) {
        window.location.search = "?" + list[0]["id"].toString();
        item.className = "item selected";
      }

    } else if (i == 0) {
      window.location.search = "?" + list[0]["id"].toString();
      item.className = "item selected";
    }
    item.onclick = async function() {
      if (this.className != "item selected") {
        document.getElementById(window.location.search.substring(1)).className = "item";
        this.className = "item selected";
        window.location.search = "?" + this.id;
        //await leveldetails(this.lastElementChild.textContent);
      }
    };
    item.id = list[i]["id"].toString();
  
    // Level rank
    const rank = document.createElement("div");
    rank.textContent = "#".concat(i+1)
    rank.className = "rank";
    item.appendChild(rank);

    // Level name
    const name = document.createElement("div");
    name.textContent = list[i]["level"]
    name.className = "name";
    item.appendChild(name);
    htmllist.appendChild(item);

    // If this level is selected
    if (item.className == "item selected") {
      await leveldetails(list[i]);
    }
  }
}

function updateLevels() {
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
  updateLevels()
}, 200)

printlist();
