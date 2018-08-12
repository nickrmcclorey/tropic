const path = require('path');
const {app, BrowserWindow} = require('electron');
const Menu = require('electron').Menu;

  function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({width: 800, height: 600, icon: 'gui/img/palm_trees.ico'})
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
