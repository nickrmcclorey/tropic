if (require('electron-squirrel-startup')) return;

const path = require('path');
const { app, BrowserWindow } = require('electron');
const Menu = require('electron').Menu;
const { exec } = require('child_process');


let win;
function createWindow() {
    global.args = process.argv;
    // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        height: 610,
        icon: iconPath(),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.setMenu(null);
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    // and load the index.html of the app.
    win.loadFile('gui/index.html');
}

app.on('ready', createWindow);

app.on('window-all-closed', app.quit);


// this is needed because the path changes from development to deployment
function iconPath() {
    return path.resolve(app.getAppPath(), 'gui/img/palm_trees.ico');
}

function runFunction(functionName) {
    win.webContents.send('executeFunction', functionName);
}


const template = [
    {
        label: 'File',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'pasteandmatchstyle' },
            { role: 'delete' },
            { role: 'selectall' }
        ]
    },
    {
        label: 'Settings',
        submenu: [
            { label: "file icons", click: () => { runFunction('showIconSettings') } },
            { label: "locations", click: () => { runFunction('openLocationSettings') } },
            { label: "programs", click: () => { runFunction('showProgramSettings') } },
            { label: "advanced", click: () => { runFunction('showAdvancedSettings') } },
            { label: "exit settings", click: () => { runFunction('hideSettings') } }
        ]
    },
    {
        role: 'window',
        submenu: [
            { role: 'minimize' },
            { role: 'close' },
            { role: 'reload' },
            { role: 'toggledevtools' }
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Learn More',
                click: () => { win.webContents.send('sayHello', 'hi') }
            }
        ]
    }
]
