const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const baseURL = process.env.BASEURL.toString();
// const bcrypt = require('bcrypt');

const Media = require('./models/mediaModel');
// const User = require('./models/userModel');

const app = express();

// middleware
app.use(cors());

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connecting to database
mongoose.connect(baseURL, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(result => {
    console.log('connected to db');
    app.listen(process.env.PORT || 5000);
  })
  .catch(err => {
    console.error('Couldn\'t connect: ', err);
  })


app.get('/', (req, res) => {
  res.redirect('/api/medias');
})

app.get('/api/medias', (req, res) => {

  Media.find()
  .sort({ updatedAt: -1 })
  .then(mediasResult => {

    const mediasArray = [];

    mediasResult.forEach(media => {
      const mediaItem = media.fileData.toString('base64');

      const mediaObject = {
        _id: media._id,
        title: media.title,
        content: media.content,
        fileData: `data:image/png;base64,${mediaItem}`,
        date: media.updatedAt
      }

      mediasArray.push(mediaObject);
    })
    res.json(mediasArray)
    
  })
  .catch(err => {
    res.json(err)
    console.log('Could not fetch from MEDIA database');
  })
});


// add a media
const upload = multer().single('fileData');

app.post('/api/medias', upload, (req, res) => {
  const { title, content } = req.body;
  const fileData = req.file.buffer;
  const orginalName = req.file.originalname;

  const media = new Media({
    title,
    content,
    fileData
  });

  media.save()
    .then(result => {
      res.json(result);
      console.log('media ' + orginalName + ' added');
    })
    .catch(err => {
      res.json(err)
      console.log('Could not post to MEDIAS database \n' + err);
    })
})


// app.post('/api/logos', upload, (req, res) => {
//   const { name } = req.body;
//   const fileData = req.file.buffer;
//   const originalname = req.file.originalname;

//   const logo = new Logo({
//     name,
//     fileData
//   })

//   logo.save()
//     .then(result => {
//       res.json(result);
//       console.log('logo ' + originalname + ' saved');
//     })
//     .catch(err => {
//       res.json(err)
//       console.log('Could not post to LOGOS database \n' + err);
//     })
// })


// // updating a media
app.put('/api/medias/:id', upload, (req, res) => {
  const { title, content } = req.body;
  const fileData = req.file.buffer;

  Media.findByIdAndUpdate(req.params.id, {$set: { title, content, fileData }} )
    .then(result => {
      res.json(result);
      console.log(result.title + ' updated successfully');
    })
    .catch(err => {
      res.json(err)
      console.log('couldn\'t update');
    })
})


// // get one media
app.get('/api/medias/:id', (req, res) => {
  Media.findById(req.params.id)
    .then(result => {
      const base64Img = result.fileData.toString('base64');

      const mediaObject = {
        _id: result._id,
        title: result.title,
        content: result.content,
        fileData: `data:image/png;base64,${base64Img}`,
        date: result.updatedAt
      }

      res.json(mediaObject)
    })
    .catch(err => {
      res.json(err);
      console.log(err);
    })
})


// // deleting one media
app.delete('/api/medias/:id', (req, res) => {
  Media.findByIdAndDelete(req.params.id)
    .then(result => {
      res.json(result);
      console.log(result.title + ' deleted successfully');
    })
    .catch(err => {
      res.json(err)
      console.log('couldn\'t delete');
    })
})


// automatically deletes all blogs after a day - except the two i added
setInterval(() => {
  // const objectsToOmit = [ '', '' ];

  Media.find()
    .then((result) => {

      result.forEach((item, index) => {
        if(index !== 0 && index !== 1) {
          Media.findByIdAndDelete(item._id)
            .then(success => {
              console.log(success.title, ' deleted successfully');

              window.location.reload();
            })
            .catch(err => {
              console.log('problem deleting', err);
            })
        }else {
          console.log(item.title + " remains");
        }
      })

    })
    .catch(err => {
      console.log('Couldn\'t fetch from MEDIA db', err);
    })

},86_400_000);
