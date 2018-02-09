const path = require('path');

const Media = require('../../entities/Media');

function html(req, res, next) {
  res.sendFile(path.join(__dirname, '../html/test.html'));
}

module.exports = {
  html
};
