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
  const levelnametxt = document.createTextNode(inputlevel["level"]);
  levelname.appendChild(levelnametxt);
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
  const creators = document.createElement("b");
  const creatorstxt = document.createTextNode(inputlevel["creators"]);
  creators.appendChild(creatorstxt);
  const publisher = document.createElement("b");
  const publishertxt = document.createTextNode(inputlevel["publisher"]);
  publisher.appendChild(publishertxt);
  const verifier = document.createElement("b");
  const verifiertxt = document.createTextNode(inputlevel["verifier"]);
  verifier.appendChild(verifiertxt);
  const creatorlabel = document.createTextNode("Created by ");
  const publisherlabel = document.createTextNode(", published by ");
  const verifierlabel = document.createTextNode(", verified by ");

  cpv.appendChild(creatorlabel);
  cpv.appendChild(creators);
  cpv.appendChild(publisherlabel);
  cpv.appendChild(publisher);
  cpv.appendChild(verifierlabel);
  cpv.appendChild(verifier);
  cpv.className = "cpvlabel";
  detailsdiv.appendChild(cpv);

  // Level description
  const desc = document.createElement("div");
  const desctxt = document.createTextNode(inputlevel["description"] ?? "No description was provided for this level yet.");
  desc.appendChild(desctxt);
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
    const videotxt = document.createTextNode("No video was found for this level.");
    video.appendChild(videotxt);
    video.className = "video";
    recordsdiv.appendChild(video);
  }
  // Records
  const recsdiv = document.createElement("div");
  recsdiv.className = "list";
  if (Object.keys(inputlevel["records"]).length > 0) {
    for (j = 0; j < Object.keys(inputlevel["records"]).length; j++) {
      const userdiv = document.createElement("div");
      const percdiv = document.createElement("div");
      userdiv.className = "recuser";
      percdiv.className = "recperc";
      const user = document.createTextNode(Object.keys(inputlevel["records"])[j]);
      const perc = document.createTextNode(inputlevel["records"][Object.keys(inputlevel["records"])[j]][0]);
      const recdiv = document.createElement("div");
      userdiv.appendChild(user);
      percdiv.appendChild(perc);
      recdiv.appendChild(userdiv);
      recdiv.appendChild(percdiv);
      recdiv.className = "item record";
      recsdiv.appendChild(recdiv);
    }
  }
  recordsdiv.appendChild(recsdiv);
  
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
    const ranktxt = document.createTextNode("#".concat(i+1));
    rank.appendChild(ranktxt);
    rank.className = "rank";
    item.appendChild(rank);

    // Level name
    const name = document.createElement("div");
    const nametxt = document.createTextNode(list[i]["level"]);
    name.appendChild(nametxt);
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

    if (name.toLowerCase().includes(inputContent)) {
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
