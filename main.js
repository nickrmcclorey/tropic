const path = require('path');
const {app, BrowserWindow} = require('electron');

  function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({width: 800, height: 600, icon: 'dependencies/palm_trees.ico'})

    // and load the index.html of the app.
    win.loadFile('gui/index.html');
  }

  app.on('ready', createWindow);


const { exec } = require('child_process');
exec('dir',(error, stdout, stderr) => {
    if (error) {
        console.log(error);
    } else {
        console.log(stdout);
    }
});
