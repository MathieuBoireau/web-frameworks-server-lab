const { Annonce } = require('../db/schema/annonce');

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  Annonce.find()
    .sort({ date: -1 })
    .then((annonces) => {
      res.render('index', {
        title: 'Annonces',
        annonces: annonces,
        readOnly: true,
        user: req.user,
      });
    });
});

module.exports = router;
