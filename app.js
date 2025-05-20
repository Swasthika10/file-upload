const express = require('express')
const app = express()
const path = require('path')
const fileUpload = require('express-fileupload');
var fs = require('fs')

const PORT = process.env.PORT || 3500
//app.use(express.static(__dirname));

app.use(fileUpload())
//app.use(express.static(__dirname + "/"));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/upload.html'));
});

app.post("/upload", function (req, res) {

  console.log(req.files.uploadFile)

  if (req.files && Object.keys(req.files).length !== 0) {

    const uploadedFile = req.files.uploadFile;

    console.log(uploadedFile);

    const allowedExt = ['.pdf', '.png', '.jpg', '.jpeg', '.txt']
    const fileSize = 5 * 1024 * 1024;
    const inputFiles = req.files
    Object.keys(inputFiles).forEach(key => {
      var fileName = inputFiles[key].name
      var ext = path.extname(fileName)
      //check for file type
      if (!allowedExt.includes(ext)) {
        return res.status(422).json({ status: "error", message: `Failed to upload! Only ${allowedExt} filetypes are allowed.` }).redirect('/');
      }

      //check for file size
      if (inputFiles[key].size > fileSize) {
        return res.status(413).json({ status: "error", message: "Failed to upload! File size must be within 5MB" }).redirect('/');
      }
    })

    //Upload path
    const uploadPath = __dirname
      + "/uploads/" + uploadedFile.name;

    uploadedFile.mv(uploadPath, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Upload failed!");
      } else {
        res.status(200).send("Upload successful!");
      }
    });
  } else {
    res.send("Please select a file to upload.");
  }
});

app.get("/download/:filename", function (req, res) {

  const fileName = req.params.filename
  console.log(req.params.filename)
  res.download(__dirname + "/uploads/" + fileName, function (err) {
    if (err) {
      console.log(err);
    }
  });
});

app.get('/files', (req, res) => {
  //show uploaded files and provide download option
  fs.readdir('./uploads', (error, files) => {
    if (error) {
      console.error(error)
      res.status(500).send({ success: false, error })
      return
    }

    console.log("FILESS", files)


    const filesHtml = fs.readFileSync('./files.html', 'utf-8')
    const fileListHtml = fs.readFileSync('./uploaded_files.html', 'utf-8')

    const fileList = files.map((file) => {
      var fileName = fileListHtml.replace('{{%NAME%}}', file)
      filesHtml.replace('{{%FILE_NAME%}}', encodeURIComponent(file))
      return fileName
    })
    const changeHtml = filesHtml.replace('{{%FILE_NAME%}}', encodeURIComponent(fileList))
    const finalHtml = changeHtml.replace('{{%CONTENT%}}', fileList)
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(finalHtml)



    // res.status(200).send({ success: true, data: files })
  })
})

app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`)
})