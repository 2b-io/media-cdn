const express = require('express');
const nocache = require('nocache');
const uuid = require('uuid');

const app = express();
const port = 3000;

const rpc = require('../services/rpc');
const storage = require('../services/storage');
const Media = require('../entities/Media');

app.use(nocache());

function handle(req, res, next) {
  let id = uuid.v4();
  console.log('handle request...', id);

  const src = 'https://assets.stuffs.cool/2017/08/the.cool.stuffs_2c450418-cd3d-4724-8316-69274dc15720.jpg';

  storage
    .meta(Media.create({
      tenant: 'thecoolstuffs',
      url: src,
      width: 360
    }))
    .then(media => {
      let exists = !!media.meta;

      if (exists) {
        // pipe media from storage to response
        storage
          .get(media)
          .then(media => {
            res.set('Content-Type', media.meta.ContentType);
            res.set('Content-Length', media.meta.ContentLength);
            res.set('Last-Modified', media.meta.LastModified);
            res.set('ETag', media.meta.ETag);

            media.toStream().pipe(res);
          });

        return;
      }

      // request background prepare media
      // then pipe media from storage to response
      rpc({
        command: 'prepare-media',
        media: media.toJSON()
      }, response => {
        handle(req, res, next);
      });
    });
}

app.get('/', handle);

app.listen(port, () => console.log(`Server started at ${port}`));
