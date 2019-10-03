const gulp = require('gulp');

gulp.series(
  require('./updateDNACSS.js').updateDNACSS,
  require('./updateDNAJS.js').updateDNAJS
)();
