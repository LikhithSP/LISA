const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');
const before = (c.match(/paddingBottom: '120px'/g) || []).length;
c = c.replace(/gap: '20px', paddingBottom: '120px'/g, "gap: '20px'");
c = c.replace(/gap: '16px', paddingBottom: '120px'/g, "gap: '16px'");
c = c.replace(/paddingBottom: '120px'/g, "paddingBottom: '0'");
const after = (c.match(/paddingBottom: '0'/g) || []).length;
fs.writeFileSync('src/App.jsx', c);
console.log(`Replaced ${before} instances -> ${after} zeros`);
