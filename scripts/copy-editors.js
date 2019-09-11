const fs = require('fs-extra')
const path = require('path');

let cwd = process.cwd();
let ogPath = path.join(cwd, 'editor');
let distPath = path.join(cwd, 'app/node_modules')
fs.copySync(ogPath, path.join(distPath, 'editor-1'));
fs.copySync(ogPath, path.join(distPath, 'editor-2'));
fs.copySync(ogPath, path.join(distPath, 'editor-3'));
fs.copySync(ogPath, path.join(distPath, 'editor-4'));
fs.copySync(ogPath, path.join(distPath, 'editor-5'));
