// This code runs as soon as the page is loaded, when 
// the script tag in the HTML file is executed. 


// It sends a GET request for the JSON file postcardData.json 

let xhr = new XMLHttpRequest();
let myurl = "showPostcard" + window.location.search;
xhr.open("GET", myurl);

// set up callback function that will run when the HTTP response comes back
xhr.onloadend = function(e) {
  // responseText is a string
  let data = JSON.parse(xhr.responseText);
  
  // get the postcard data out of the object "data" and 
  // configure the postcard
  let postcardImage = document.getElementById("cardImg");
  postcardImage.style.display = 'block';
  postcardImage.src = "http://ecs162.org:3000/images/kaiyoshida/" + data.image;
  let postcardMessage = document.getElementById("message");
  //postcardMessage.textContent = data.message;
  // textContent throws away newlines; so use innerText instead
  postcardMessage.innerText = data.message; 
  postcardMessage.className = data.font;
  document.querySelector(".postcard").style.backgroundColor = data.color;
}

// send off request
xhr.send(null);