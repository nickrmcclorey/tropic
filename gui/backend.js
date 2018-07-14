
const {exec} = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');



let currentFolder = {};

function init() {
    currentFolder.path = os.homedir();
    currentFolder.files = fs.readdirSync(os.homedir());
    console.log(currentFolder);
}
init();
