
var onHeaders = require('on-headers')
var os  = require('os-utils');

/**
 * Reponse time:
 *
 * Adds the `wpa-st` cookie displaying the response
 * duration in milliseconds.
 *
 * @param {number} [digits=3]
 * @return {function}
 * @api public
 */

module.exports = function responseTime(digits) {
  digits = digits === undefined ? 0 : digits;

  return function responseTime(req, res, next) {
    var startAt = process.hrtime();

    onHeaders(res, function () {
      var diff = process.hrtime(startAt);
      var ms = diff[0] * 1e3 + diff[1] * 1e-6;
	  res.cookie('wpa-st', ms.toFixed(digits), { httpOnly: false });
    })
    next();
  }
}