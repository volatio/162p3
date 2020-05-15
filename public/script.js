"use strict";

// Unicode characters we will use
const diamond = "\u27e1";
const cross = "\u2756";

// querySelector returns the first element that matches the
// given CSS selector; in this case, the first span with id "fonts"
let currentFontIcon = document.querySelector("#fonts span");
let filen = "";

// add event listeners
document.querySelectorAll("#fonts input").forEach(i => {
  // if status of one button changes, this will be called
  i.addEventListener("change", () => {
    // because these are radio buttons, i.checked is true for
    // the one selected
    if (i.checked) {
      console.log("checked");
      // change diamonds
      // put the crossed diamond in front of this choice
      i.previousElementSibling.textContent = cross;
      // put the regular diamond in front of the last choice
      currentFontIcon.textContent = diamond;
      // and remember that this is the current choice
      currentFontIcon = i.previousElementSibling;

      document.querySelector("#message").className = i.value;
    }
  });
});

//CHANGE COLOR

const colors = [
  "#e6e2cf",
  "#dbcaac",
  "#c9cbb3",
  "#bbc9ca",
  "#A6A5B5",
  "#B5A6AB",
  "#ECCFCF",
  "#eceeeb",
  "#BAB9B5"
];

// querySelectorAll returns a list of all the elements with class color-box
const colorBoxes = document.querySelectorAll(".color-box");

colorBoxes.item(0).style.border = "1px solid black";
let currentColor = colorBoxes.item(0);

colorBoxes.forEach((b, i) => {
  b.style.backgroundColor = colors[i];

  b.addEventListener("click", () => {
    // colorBoxes.forEach((d) => {
    //   d.style.border = 'none';
    // })
    currentColor.style.border = "none";
    b.style.border = "1px solid black";
    document.querySelector(".postcard").style.backgroundColor = colors[i];
    currentColor = b;
  });

  b.addEventListener("mouseover", () => {
    b.style.border = "1px dashed black";
    document.querySelector(".postcard").style.backgroundColor = colors[i];
  });
  b.addEventListener("mouseout", () => {
    if (b != currentColor) {
      b.style.border = "none";
      document.querySelector(".postcard").style.backgroundColor =
        currentColor.style.backgroundColor;
    } else {
      b.style.border = "1px solid black";
    }
  });
});

// UPLOAD postcard data
// When the user hits the button...
document.querySelector("#save").addEventListener("click", () => {
  let msg = document.querySelector("#message");
  let img = document.querySelector("#cardImg");
  let insertId = randString(22);
  let ind = img.src.lastIndexOf('/');
  let data = {
    id: insertId,
    image: img.src.substring(ind + 1),
    color: currentColor.style.backgroundColor,
    font: msg.className,
    message: msg.innerText
  };
  console.log(data);

  // new HttpRequest instance
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", "/saveDisplay");
  // important to set this for body-parser
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  // setup callback function
  xmlhttp.onloadend = function(e) {
    console.log(xmlhttp.responseText);
    document.querySelector("#overlay").style.display = "flex";
    let clink = document.querySelector("#clink");
    clink.innerHTML = ("https://cerulean-denim-meerkat.glitch.me/display.html?id=" + insertId).link("https://cerulean-denim-meerkat.glitch.me/display.html?id=" + insertId);
    // immediately switch to display view
    //window.location = "https://cerulean-denim-meerkat.glitch.me/display.html";
  };
  // all set up!  Send off the HTTP request
  xmlhttp.send(JSON.stringify(data));
});

document.querySelector("#xbutton").addEventListener("click", () => {
  document.querySelector("#overlay").style.display = "none";
});

// UPLOAD IMAGE
document.querySelector("#imgUpload").addEventListener("change", () => {
  // get the file with the file dialog box
  const selectedFile = document.querySelector("#imgUpload").files[0];
  // store it in a FormData object
  const formData = new FormData();
  formData.append("newImage", selectedFile, selectedFile.name);
  filen = selectedFile.name;
  let button = document.querySelector(".btn");

  // build an HTTP request data structure
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/upload", true);
  xhr.onloadend = function(e) {
    sendGetRequest(filen);
    // Get the server's response to the upload
    console.log(xhr.responseText);
  };

  button.textContent = "Uploading...";
  // actually send the request
  xhr.send(formData);
});

function randString(len) {
  let out = "";
  // base 36 is how you decode binary to ASCII text
  // not sure why the example code start at position 2 to get sub-string
  // instead of getting max possible length I am doing 1 character at a time
  while (out.length < len)
    out += Math.random()
      .toString(36)
      .substr(2, 1);
  return out;
}

function showMsg(elmtId, returnedText, otherOne) {
        let msg = document.getElementById(elmtId);
        msg.innerHTML = msg.textContent.trim()+returnedText;
}

// sends an AJAX request asking the server 
function sendGetRequest(filename) {
  let xhr = new XMLHttpRequest;
  // it's a GET request, it goes to URL /seneUploadToAPI
  xhr.open("POST","sendUploadToAPI");
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  // Add an event listener for when the HTTP response is loaded
  xhr.addEventListener("load", function() {
    let newImage = document.querySelector("#cardImg");
    let button = document.querySelector(".btn");
    newImage.src = "http://ecs162.org:3000/images/kaiyoshida/" + filename;
    newImage.style.display = "block";
    document.querySelector(".image").classList.remove("upload");
    button.textContent = "Replace Image";
    delimage(filename);
  });
  let fn = {"name": filename};
  // Actually send request to server
  xhr.send(JSON.stringify(fn));
}

function delimage(filename) {
  let xhr = new XMLHttpRequest;
  xhr.open("POST", "delimage");
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

  let fn = {"name": filename};
  xhr.send(JSON.stringify(fn));
}