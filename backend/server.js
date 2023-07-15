const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');
const multer = require('multer');
const cors = require('cors');
const bcrypt = require('bcrypt');

const Media = require('./models/mediaModel');
// const User = require('./models/userModel');

const app = express();

// middleware
app.use(cors());

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbUrl = 'mongodb+srv://sixtusnwaogu:admin12345@post-db.8unssrf.mongodb.net/postgallery?retryWrites=true&w=majority';
// 'mongodb://127.0.0.1:27017/postgallery'
// 'mongodb+srv://sixtusnwaogu:admin12345@post-db.8unssrf.mongodb.net/postgallery?retryWrites=true&w=majority'

// connecting to database
mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(result => {
    console.log('connected to db');
    app.listen(3000);
  })
  .catch(err => {
    console.error('Couldn\'t connect: ', err);
  })



// // for when i start user auth

// // get users
// app.get('/api/users', (req, res) => {
//   User.find()
//     .then(users => {
//       res.json(users);
//     })
//     .catch(err => {
//       res.json("Couldn't fetch users", err);
//     })
// })


// // user signup
// app.post('/api/users/signup', (req, res) => {
//   const { username, password } = req.body;

//   bcrypt.hash(password, 10)
//     .then(hash => {
//       const user = new User({
//         username,
//         password: hash
//       })

//       return user.save();
//     })
//     .then(result => {
//       res.json(result.username);
//       console.log(`User ${result.username} added successfully`);
//     })
//     .catch(err => {
//       res.json("Couldn't add user ", err);
//       console.log("User not added");
//     })
// })

// //user login
// app.post('/api/users/login', (req, res) => {
//   const { username, password } = req.body;

//   User.findOne({ username })
//     .then(user => {
//       bcrypt.compare(password, user.password)
//         .then(() => {
//           res.json("Password matches");
//           console.log('Password matches');
//         })
//         .catch(err => {
//           res.json('Passwords did not match!', err);
//           console.log('Password mismatch', err);
//         })
//     })
//     .catch(err => {
//       res.json("Couldn't find user", err);
//       console.log("Couldn't find user", err);
//     })
// })


// media routes



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
