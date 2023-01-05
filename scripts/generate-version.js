const fs = require('fs');
const path = require('path');

const { version } = require('../package.json');

fs.writeFileSync(path.join(__dirname, '..', 'src', 'version.tsx'), `export default '${version}'`, 'utf8');
