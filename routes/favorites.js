'use strict';

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();

const authorize = function(req, res, next) {
  jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      return next(boom.create(401, 'Unauthorized'));
    }

    req.claim = payload;

    next();
  });
};

router.get('/favorites', authorize, (req, res, next) => {
  knex('favorites')
    .innerJoin('books', 'books.id', 'favorites.book_id')
    .where('favorites.user_id', req.claim.userId)
    .orderBy('title', 'ASC')
    .then((rows) => {
      const favorites = camelizeKeys(rows);

      res.send(favorites);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/favorites/check', authorize, (req, res, next) => {
  let bookId = Number.parseInt(req.query.bookId);

  if (Number.isNaN(bookId)) {
      return next(boom.create(400, 'BookId must be an integer'));
  }

  knex('favorites')
    .where({
      book_id: bookId,
      user_id: req.claim.userId
    })
    .first()
    .then((book) => {
      const favorites = camelizeKeys(book);

      res.send(favorites);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
