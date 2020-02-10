var express = require("express");
var app = express();
var cors = require('cors')
var nodemailer = require("nodemailer");
var bodyParser = require('body-parser');
var multer = require('multer'),
var upload = multer({ dest: 'upload/'});
var fs = require('fs');

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/Users');

var UserSchema = new mongoose.Schema({
    Email : String,
    Password : String,
    FullName: String,
    Location : String,
    Interest : [],
    Picture : String,
});

var Users = mongoose.model('user', UserSchema)

mongoose.connection.on('connected', function(){
    console.log('Connected')
});

mongoose.connection.on('error', function(e){
    console.log('Error', e)
});

mongoose.connection.on('disconnected', function(){
    console.log('Disconnected')
});


var type = upload.single('recfile');

app.post('/upload', type, function (req,res) {
 var tmp_path = req.file.path;
 var target_path = 'uploads/' + req.file.originalname;
 var src = fs.createReadStream(tmp_path);
  var dest = fs.createWriteStream(target_path);
  src.pipe(dest);
  
  src.on('end', function() { res.render('complete'); });
  src.on('error', function(err) { res.render('error'); });

});

app.get("/getusers", (req, res) => {
    Users.find({}, (err, result) => {
        console.log('Results : ', result)
        if(err) {
            return response.status(400).send(err);
        }
        res.send(result);
    });
});


app.post("/adduser", (req, res) => {
    console.log(req)
    var new_User = new Users(req.body);
    new_User.save(function (err,User) {
        if(err){
            res.send(err);
        }            
        res.json(User);   
    });
});

app.get("/singleuser",(req, res) =>{
    var id = mongoose.Types.ObjectId(req.query.UserId);
    Users.findById({_id:id},function(err, Users) {
      if (err){
        res.send(err);
      }
      res.json(Users);
    });
  });


app.post("/login", (req, res) => {
    const { Email, Password } = req.body;
    console.log(req.body)
    Users.find({'Email': Email, 'Password':Password },(err, result)=>{
        if(err){
            res.send('Record not found')
        }
        else {
            res.send(result)
            console.log(result)
        }
    })
});

  

app.put("/updateuser",(req, res) =>{
    var id = mongoose.Types.ObjectId(req.query.UserId);
    console.log('Id :' , id)
    console.log(req.body)
    Users.findOneAndUpdate({_id:id}, req.body,  {new: true, useFindAndModify: false} ,function (err,Users){
    if(err){
    res.send(err);
    }
    res.json(Users);

    });
});

app.delete("/deleteuser",(req, res) =>{
    var id = mongoose.Types.ObjectId(req.query.UserId);
    Users.remove({
      _id: id
    }, function(err, Users) {
      if (err){
        res.send(err);
      }
      res.json({message: 'User successfully deleted' });
    });
  });



app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});
