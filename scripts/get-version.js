fs = require('fs')
json = JSON.parse(fs.readFileSync('package.json'))
console.log(json.version)