var express = require("express")
app = express()
http = require("http").Server(app).listen(8080)
console.log("server started!");
upload = require("express-fileupload")
app.use(upload())
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html")
})
app.post("/", function (req, res) {
    if (req.files) {
        console.log(req.files);
        var file = req.files.filename
        filename = file.name
        file.mv("./" + filename, function (err) {
            if (err) {
                console.log(err);
            }
        })
    }


})

//*********************Js******************/
//var reader = new FileReader();  
// reader.onload = (function(theFile) {
//     return function(e) {  
//       this.localUrl = e.target.result ;
//       console.log(e.target.result.toString())
//     };
//   })(event.target.files[0]);   
//   reader.readAsText(event.target.files[0]); 

// const multipart = require('connect-multiparty');
// const multipartMiddleware = multipart({
//     uploadDir: './uploads'
// });


const multer = require('multer');
const upload = multer({ limits: { fileSize: 1024 * 1024 } });
const pdf = require('pdf-parse');
var WordExtractor = require("word-extractor");
var extractor = new WordExtractor();

app.post("/savefile",
    upload.single("uploads"),
    // multipartMiddleware,
    (req, res) => {
        console.log(req.body);
        console.log(req.files);
        var file = req.files.uploads;
        filename = file.name
        file.mv("./" + filename, function (err) {
            if (err) {
                console.log(err);
            }
        })
        var type = req.file.mimetype
        var buffer = req.file.buffer;


        //make folder        
        if (!fs.existsSync('./uploads')) {
            fs.mkdir('uploads', function (error) {
                if (error) {
                    console.log(error);
                    return false;
                }
                console.log('folder is created successfully.');
            })
        }
        //check type
        if (type === "application/pdf") {
            //get pdf cannot open
            pdf(buffer).then(function (data) {
                console.log(data.text);

                fs.writeFile("./uploads/" + filename, data.text, function (err) {
                    if (err) throw err;
                    console.log('File is created successfully.');
                })
            })
        } else if (type === "application/msword") {
            fs.writeFile("./uploads/" + filename, buffer, function (err) {
                if (err) throw err;
                console.log('File is created successfully.');
            })

            var extracted = extractor.extract("./uploads/" + filename);
            extracted.then(function (doc) {
                console.log(doc.getBody());
                //cannot get word title
                fs.writeFile("./uploads/" + filename, doc.getBody(), function (err) {
                    if (err) throw err;
                    console.log('File is created successfully.');
                })
            });

        }

        res.json({
            'message': 'File uploaded succesfully.'
        });
    })