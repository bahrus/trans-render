const jiife = require('jiife');
jiife.processFiles(['init.js'], 'dist/init.js', true);
jiife.processFiles(['update.js'], 'dist/update.js', true);
jiife.processFiles(['interpolate.js'], 'dist/interpolate.js', true);