const path = require('path');
const {app, BrowserWindow} = require('electron');
const Menu = require('electron').Menu;
const fs = require('fs');
  function createWindow () {

    // Create the browser window.
    win = new BrowserWindow({width: 800, height: 600, icon: iconPath()})
    win.setMenu(null);
     const menu = Menu.buildFromTemplate(template);
     Menu.setApplicationMenu(menu);


    // and load the index.html of the app.
    win.loadFile('gui/index.html');
  }

  app.on('ready', createWindow);


  app.on('window-all-closed', () => {
      app.quit()
  });


// this is needed because the path changes from development to deployment
function iconPath() {
    return path.resolve(__dirname, 'gui/img/palm_trees.ico');
    if (fs.existsSync('gui/img/palm_trees.ico')) {
        return 'gui/img/palm_trees.ico';
    } else {
        return 'resources/app/gui/img/palm_trees';
    }
}


const template = [
{
  label: 'I have control',
  submenu: [
    {role: 'undo'},
    {role: 'redo'},
    {type: 'separator'},
    {role: 'cut'},
    {role: 'copy'},
    {role: 'paste'},
    {role: 'pasteandmatchstyle'},
    {role: 'delete'},
    {role: 'selectall'}
  ]
},
{
  label: 'View',
  submenu: [
    {role: 'reload'},
    {role: 'forcereload'},
    {role: 'toggledevtools'},
    {type: 'separator'},
    {role: 'resetzoom'},
    {role: 'zoomin'},
    {role: 'zoomout'},
    {type: 'separator'},
    {role: 'togglefullscreen'}
  ]
},
{
  role: 'window',
  submenu: [
    {role: 'minimize'},
    {role: 'close'}
  ]
},
{
  role: 'help',
  submenu: [
    {
      label: 'Learn More',
      click () { pasteSelectedFiles(); }
    }
  ]
}
]
