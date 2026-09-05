const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');
const b = (c.match(/paddingBottom: '120px'/g) || []).length;
c = c.replace(/paddingBottom: '120px'/g, "paddingBottom: '0'");
fs.writeFileSync('src/App.jsx', c);
console.log(b + ' replaced');
