const { Annonce } = require('../db/schema/annonce');

var express = require('express');
var path = require('path');
var multer = require('multer');
var router = express.Router();
var auth = require('../auth');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/:id', async function (req, res, next) {
  const id = req.params.id;
  const annonce = await Annonce.findById(id);
  if (annonce.publication_status === 'non publiée') {
    if (req.user?.permission !== 'agent') {
      // forbidden
      res.redirect('/');
      return;
    }
  }
  const photoCount = annonce.photos ? annonce.photos.length : 0;
  res.render('adverts', {
    title: annonce.title,
    annonce: annonce,
    annonceChange: annonce,
    readOnly: false,
    user: req.user,
    photoCount,
  });
});

// photos
router.get('/:id/images/:n', async function (req, res, next) {
  const annonce = await Annonce.findById(req.params.id);
  const n = req.params.n;
  if (annonce.photos && n > 0 && n <= annonce.photos.length) {
    const photo = annonce.photos[n - 1];
    res.end(Buffer.from(photo.buffer), 'binary');
  } else {
    res.sendFile(path.join(__dirname, '../public/images/not_found.png'));
  }
});

router.post(
  '/:id',
  upload.array('photos'),
  auth.authorizeAgent,
  async function (req, res, next) {
    //update
    const id = req.params.id;
    let title = req.body.title;
    let type = req.body.type;
    let status = req.body.status;
    if (!req.body.publication_status)
      req.body.publication_status = 'non publiée';
    let description = req.body.description;
    let price = req.body.price;
    let date = req.body.date;
    let photos = req.files?.map((file) => file.buffer);
    req.body.photos = photos;
    const errors = {
      title: title == '',
      type: type == '',
      status: status == '',
      description: description == '',
      price: price == '',
      date: date == '',
    };
    if (Object.values(errors).includes(true)) {
      // errors
      res.render('adverts', {
        title: "Mettre à jour l'annonce",
        annonce: await Annonce.findById(id),
        annonceChange: req.body,
        readOnly: false,
        user: req.user,
        errorsForm: errors,
      });
    } else {
      await Annonce.findByIdAndUpdate(id, req.body);
      res.redirect('/');
    }
  }
);

// questions, permission = user
router.post('/:id/question', auth.authorizeUser, function (req, res, next) {
  const id = req.params.id;
  Annonce.findByIdAndUpdate(id, {
    $push: { questions: { title: req.body.text, author: req.user.username } },
  })
    .then((_) => {
      res.redirect(`/annonces/${id}`);
    })
    .catch((annonce) => {
      console.error('POST questions error ' + annonce);
      res.redirect('/');
    });
});

// questions & answers, permission = agent
router.post(
  '/:id/question/:questionId',
  auth.authorizeAgent,
  function (req, res, next) {
    const { id, questionId } = req.params;
    Annonce.findByIdAndUpdate(id, {
      $set: {
        [`questions.${questionId}.answer`]: {
          title: req.body.text,
          author: req.user.username,
        },
      },
    })
      .then((_) => {
        res.redirect(`/annonces/${id}`);
      })
      .catch((annonce) => {
        console.error('POST answers error ' + annonce);
        res.redirect('/');
      });
  }
);

router.post(
  '/:id/delete',
  auth.authorizeAgent,
  async function (req, res, next) {
    await Annonce.findByIdAndDelete(req.params.id);
    res.redirect('/');
  }
);

module.exports = router;
