/*
Student Name: Elmira Mirza
Student Id:130828197
email:emirza2@myseneca.ca
WEB322NFF
*/ 

const HTTP_PORT = process.env.PORT || 8080;
const HTTPS_PORT = 4433;
const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require('body-parser');
const app = express();
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const clientSessions = require("client-sessions");
const bcrypt = require('bcryptjs');
const fs = require("fs");
const http = require("http");
const https = require("https");
const WEEK10ASSETS = "./views/";
const webAir = "";
const SSL_KEY_FILE =  "server.key";
const SSL_CRT_FILE =  "server.crt";
const multer = require("multer");

app.use(express.static(__dirname + '/public'));


app.use(bodyParser.urlencoded({ extended: true }));

// for parsing application/json
app.use(express.json()) 

app.use(express.urlencoded({ extended: true })) 
app.set("view engine", ".hbs");


app.get("/", function(req,res){

    res.status(200).redirect('/HomePage');
});



const sequelize = new Sequelize('d2sj5cphfueruq', 'vqfksbwmaqjtds', 'fcf8a4d102ac12b4c3b1b089928eb43010473a3ef70c07097a6dd064ec05a3b1', {
    host: 'ec2-3-216-89-250.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    }
});

sequelize
    .authenticate()
    .then(function() {
        console.log('Connection has been established successfully.');
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err);
    });
////////******

// read in the contents of the HTTPS certificate and key
const https_options = {
    key: fs.readFileSync(__dirname + "/" + SSL_KEY_FILE),
    cert: fs.readFileSync(__dirname + "/" + SSL_CRT_FILE)
};

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/Login");
  } else {
    next();
  }
}

// Register handlerbars as the rendering engine for views
app.engine(".hbs", exphbs({ extname: ".hbs" }));

// Setup the static folder that static resources can load from
// like images, css files, etc.
app.use(express.static("static"));

// Setup client-sessions
app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "week10example_web322", // this should be a long un-guessable string.
  duration: 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}
function onHttpsStart() {
    console.log("Express https server listening on: " + HTTPS_PORT);
}

// Setup a route on the 'root' of the url to redirect to /login
app.get("/", (req, res) => {
  res.redirect("/Login");
});

// Display the login html page
app.get("/Login", function(req, res) {
  res.render("Login", { layout: false });
});

// The login route that adds the user to the session
app.post("/Login", (req, res) => {
  const username = req.body.email;
  const password = req.body.password;

  if(username === "" || password === "") {
    // Render 'missing credentials'
    return res.render("login", { errorMsg: "Missing credentials.", layout: false });
  }

  bcrypt.compare(password, User.password).then((result) => {
    // result === true
    if(username === User.email && result===true){

        // Add the user on the session and redirect them to the dashboard page.
        req.session.User = {
          password: User.password,
          email: User.email
        };
        res.redirect("/dashboard");
      } else {
        // render 'invalid username or password'
        res.render("login", { errorMsg: "invalid username or password!", layout: false});
      }

    });

  // use sample "user" (declared above)
  
});

// Log a user out by destroying their session
// and redirecting them to /login
app.get("/logout", function(req, res) {
  req.session.reset();
  res.redirect("/Login");
});

// ensureLogin here checks for authorization
// do you have an active session?

app.get("/dashboard", ensureLogin, (req, res) => {
  res.render("dashboard", {user: req.session.user, layout: false});
});

http.createServer(app).listen(HTTP_PORT, onHttpStart);
https.createServer(https_options, app).listen(HTTPS_PORT, onHttpsStart);
 ///////////****** */
const User = sequelize.define("User", {
  uEmail: {type:Sequelize.STRING,
    unique:true
  
  
  },  
  uFirstname: Sequelize.STRING, 
  uLastname: Sequelize.STRING, 
  uPassword: Sequelize.STRING, 
  uBirthdate: Sequelize.STRING, 
});

app.post("/addUser", (req, res) => {
  bcrypt.hash(req.body.r_password, 10).then(hash=>{ // Hash the password using a Salt that was generated using 10 rounds
    // TODO: Store the resulting "hash" value in the DB
    uPassword=hash;
  
})
.catch(err=>{
    console.log(err); // Show any errors that occurred during the process
});
  User.create({ 
    userID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
  },    
    ly:req.body.lyear,
    lm:req.body.lmonth,
    ld:req.body.lday,
    uEmail: req.body.r_email,
    uFirstname: req.body.r_name,
    uLastname: req.body.r_Lname,
    //uPassword: req.body.r_password,
    uBirthdate:ly.concat(lm,ld)
    
  })
  //validate data
  var msg = '';
  // check if the data is blank
  if (dataValid) { dataValid = User.uFirstname != ' '; msg = 'First Name Blank!';}
  if (dataValid) { dataValid = User.uLastname != ' '; msg = 'Last Name Blank!';}
  if (dataValid) { dataValid = User.uEmail != ' '; msg = 'Email Blank!';}
  if (dataValid) { dataValid = User.uBirthdate != ' '; msg = 'Birth Date Blank!';}
  if (dataValid) { dataValid = User.uPassword != ' '; msg = 'Password Blank!';}
  console.log('msg:' + msg);
  // check if email format is correct
  if (dataValid) { 
      var emailMask = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*/i;
      dataValid = emailMask.test(User.uEmail);
      msg = 'Email have invalid format!';
  }
  console.log('msg:' + msg);
 
  //check if email already exists in database
  if (dataValid) {
      sequelize.sync().then(async function() {
          await User.findAll({ 
          attributes: ['userID'],
          where: {
            uEmail : User.uEmail
              }
          }).then(function(data){
          
              // pull the data (exclusively)
              data = data.map(value => value.dataValues);

              console.log("Email already exists in database!");
              for(var i =0; i < data.length; i++){
                  console.log("UserID " + data[i].userID + " have the email: " + User.uEmail);
              }
              dataValid = false;
              msg = 'Email already exists in database!';
          })
          .catch(function(err) {
              console.log('Unable to connect to the database:', err);
          });
      });    
  }
  console.log('msg:' + msg);
  console.log (User);

  // if do not exist in database, create new user
  if (dataValid) {
      sequelize.sync().then(async function() {
      await User.create({
         
        uFirstname : User.uFirstname,
        uLastname : User.uLastname,
          uEmail : User.uEmail,
          uBirthdate : User.uBirthdate,
          //uPassword : User.uPassword,
      }).then(function(){
          dataValid = true;
          msg =  'User ' + User.userID + ' - ' + User.uFirstname + ' ' + User.uLastname + ' added with success!';
          console.log(msg);
      })
      .catch(function(err) {
          dataValid = false;
          msg = 'Error when try to insert new User: ' + User.uFirstname + ' ' + User.uLastname;
          console.log('Unable to connect to the database:', err);
      });
  });
}

});

  

var dataValid = true;

app.render('HomePage', {
  data: dataValid,
  layout: false // do not use the default Layout (main.hbs)
});
//image upload admin
const storage = multer.diskStorage({
  destination: "./public/photos/",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.use(express.static("./public/"));
app.get("/", (req, res) => {
  // send the html view with our form to the client
  res.sendFile(path.join(__dirname, "/views/dashboard.hbs"));
});
app.post("/register-user", upload.single("photo"), (req, res) => {
  const formData = req.body;
  const formFile = req.file;

  const dataReceived = "Your submission was received:<br/><br/>" +
    "Your form data was:<br/>" + JSON.stringify(formData) + "<br/><br/>" +
    "Your File data was:<br/>" + JSON.stringify(formFile) +
    "<br/><p>This is the image you sent:<br/><img src='/photos/" + formFile.filename + "'/>";
  res.send(dataReceived);
});
//end image upload admin
//add room admin
const Room = sequelize.define("Room", {
  r_Id: {type:Sequelize.STRING,
    unique:true
  
  
  },  
  rtitle: Sequelize.STRING, 
  rprice: Sequelize.STRING, 
  rdesc: Sequelize.STRING, 
  rloc: Sequelize.STRING, 
  rimg: Sequelize.STRING,
});
app.post("/addroom", (req, res) => {
  Room.create({ 
    userID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
  },    
  rtitle:req.body.rtitle,
  rprice:req.body.rprice,
  rdesc:req.body.rdesc,
  rloc: req.body.rloc,
  rimg: req.body.rimg, 
    
  })

});
//end add room admin
 

app.get("/Registration", (req, res) => {
  // check session
  var session = checkSession();

  // if customer not logged
  if(!session) {
      res.status(200).render('Registration', {
          layout: false // do not use the default Layout (main.hbs)
     });
  } else {
      res.status(500).render('Registration', {
          layout: false // do not use the default Layout (main.hbs)
     });
  }
});


app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/login");
});

app.get("/dashboard", ensureLogin, (req, res) => {
  res.render("dashboard", {
    user: req.session.user,
    layout: false });
  });


app.use((req, res) => {
  res.status(404).send("Page Not Found");
});


