const { createAnnonce } = require('../db/schema/annonce');

var express = require('express');
var multer = require('multer');
var router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
var auth = require('../auth');

const renderOptions = {
  title: 'Ajouter une annonce',
  annonceChange: {},
  action: '/addAdvert',
  readOnly: true,
};

/** addAdvert, permission = agent */
router
  .get('/', auth.authorizeAgent, function (req, res, next) {
    res.render('addAdvert', { ...renderOptions, user: req.user });
  })
  .post(
    '/',
    upload.array('photos'),
    auth.authorizeAgent,
    async function (req, res) {
      let title = req.body.title;
      let type = req.body.type;
      let publication_status =
        req.body.publication_status === undefined ? 'non publiée' : 'publiée';
      let status = req.body.status;
      let description = req.body.description;
      let price = req.body.price;
      req.body.date = req.body.date == '' ? '' : new Date(req.body.date);
      let date = req.body.date;
      let photos = req.files?.map((file) => file.buffer);
      req.body.photos = photos;
      const errors = {
        title: title == '',
        type: type == undefined,
        status: status == '',
        description: description == '',
        price: price == '',
        date: date == '',
      };
      if (Object.values(errors).includes(true)) {
        // errors
        res.render('addAdvert', {
          ...renderOptions,
          user: req.user,
          annonceChange: req.body,
          errorsForm: errors,
        });
      } else {
        const { annonceId } = await createAnnonce(
          title,
          type,
          publication_status,
          status,
          description,
          price,
          date,
          photos
        );
        res.redirect('/annonces/' + annonceId);
      }
    }
  );

module.exports = router;
