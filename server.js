// server.js
// where your node app starts

// include modules
const express = require('express');
const FormData = require("form-data");
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const sqlite3 = require('sqlite3');

// connecting to database
let db = new sqlite3.Database(__dirname+'/public/postcards.db', sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.log('postcards.db does not exist');
    return console.error(err.message);
  }
  console.log('opened connection to postcards.db');
});

db.run('CREATE TABLE IF NOT EXISTS postcards (id, image, color, font, message)');

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname+'/images')    
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
// let upload = multer({dest: __dirname+"/assets"});
let upload = multer({storage: storage});


// begin constructing the server pipeline
const app = express();

// Serve static files out of public directory
app.use(express.static('public'));

// Also serve static files out of /images
app.use("/images",express.static('images'));

// Handle GET request to base URL with no other route specified
// by sending creator.html, the main page of the app
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/public/creator.html');
});

app.get("/showPostcard?", function (request, response) {
  console.log(request.query);
  let ssql = 'SELECT DISTINCT Id id, Image image, Color color, Font font, Message message FROM postcards WHERE Id = ?';
  db.get(ssql, [request.query.id], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    console.log(row);
    response.send(row);
  });
})

// Next, the the two POST AJAX queries

// Handle a post request to upload an image. 
app.post('/upload', upload.single('newImage'), function (request, response) {
  console.log("Recieved",request.file.originalname,request.file.size,"bytes")
  if(request.file) {
    // file is automatically stored in /images, 
    // even though we can't see it. 
    // We set this up when configuring multer
    response.end("recieved "+request.file.originalname);
  }
  else throw 'error';
});


// Handle a post request containing JSON
app.use(bodyParser.json());
// gets JSON data into req.body
app.post('/saveDisplay', function (req, res) {
  db.run('CREATE TABLE IF NOT EXISTS postcards (id, image, color, font, message)');
  console.log(req.body);
  db.run('INSERT INTO postcards(id, image, color, font, message) VALUES (?, ?, ?, ?, ?)',
         [req.body.id,
          req.body.image,
          req.body.color,
          req.body.font,
          req.body.message
         ],
    (err) => {
      if (err) {
        return console.log(err.message);
      }
    console.log('updated server');
  });
  
  // write the JSON into postcardData.json
  fs.writeFile(__dirname + '/public/postcardData.json', JSON.stringify(req.body), (err) => {
    if(err) {
      res.status(404).send('postcard not saved');
    } else {
      res.send("All well")
    }
  })
  
});

// fire off the file upload if we get this "GET"
app.post("/sendUploadToAPI", function(request, response){
  console.log(request.body);
        sendMediaStore(request.body.name, request, response);
        });

// function called when the button is pushed
// handles the upload to the media storage API
function sendMediaStore(filename, serverRequest, serverResponse) {
  let apiKey = process.env.ECS162KEY;
  if (apiKey === undefined) {
    serverResponse.status(400);
    serverResponse.send("No API key provided");
  } else {
    // we'll send the image from the server in a FormData object
    let form = new FormData();
    
    // we can stick other stuff in there too, like the apiKey
    form.append("apiKey", apiKey);
    // stick the image into the formdata object
    form.append("storeImage", fs.createReadStream(__dirname + "/images/" + filename));
    // and send it off to this URL
    form.submit("http://ecs162.org:3000/fileUploadToAPI", function(err, APIres) {
      // did we get a response from the API server at all?
      if (APIres) {
        // OK we did
        console.log("API response status", APIres.statusCode);
        // the body arrives in chunks - how gruesome!
        // this is the kind stream handling that the body-parser 
        // module handles for us in Express.  
        let body = "";
        APIres.on("data", chunk => {
          body += chunk;
        });
        APIres.on("end", () => {
          // now we have the whole body
          if (APIres.statusCode != 200) {
            serverResponse.status(400); // bad request
            serverResponse.send(" Media server says: " + body);
          } else {
            serverResponse.status(200);
            serverResponse.send(body);
          }
        });
      } else { // didn't get APIres at all
        serverResponse.status(500); // internal server error
        serverResponse.send("Media server seems to be down.");
      } // else
    });
  }
}


// The GET AJAX query is handled by the static server, since the 
// file postcardData.json is stored in /public

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
