const path = require('path');

const rpc = require('../../services/rpc');

const Media = require('../../entities/Media');

function html(req, res, next) {
  res.sendFile(path.join(__dirname, '../html/test.html'));
}

function worker(req, res, next) {
  let media = Media.create({
    tenant: 'thecoolstuffs',
    url: 'https://assets.stuffs.cool/2017/10/the.cool.stuffs_a50e04cd-b5fb-43c7-a39c-9b2d0cc56965.jpg',
    width: 320
  });

  rpc({
    command: 'prepare-media',
    media: media.toJSON()
  }, response => {
    if (response.succeed) {
      return res.json(media.toJSON());
    }

    res.sendStatus(404);
  });
}

module.exports = {
  html,
  worker
};
