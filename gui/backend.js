const {exec} = require('child_process');
const os = require('os');
const fs = require('fs');
const pathModule = require('path');
const { ipcRenderer } = require('electron');
const $ = require('jquery')
const shell = require('node-powershell')
const fii = require('file-icon-info');

// ==== global variables ==== \\
let currentFolder = {};
let Tracker = {};
let templates = null;
const settings = require('./settings.json');
let selectedFiles = new SelectedFiles();
let defaultIcons = new Object();
let settingsInputBox = null;
// ==== end of global variables ====\\


function init() {
    setInitListeners();
    templates = $('#templates').remove()[0];
    templates.removeAttribute('hidden');
    loadDefaultIcons();

    let openingPath = "";
    if (Object.keys(settings).includes('homeFolder')) {
        openingPath = settings.homeFolder;
    } else {
        openingPath = os.homedir();
    }

    let fileFieldParent = $('#fileFieldParent')[0];
    Tracker = new PaneTabTracker(fileFieldParent, openingPath);
    Tracker.refresh();

    loadExternalPrograms();
}

function handleClick(e) {
    for (fileField of $('.fileField')) {
        if (e.path.includes(fileField) && Tracker.activePane.fileField != fileField) {
            for (pane of Tracker.panes) {
                if (pane.fileField == fileField) {
                    Tracker.activePane = pane;
                }
            }
        }
    }

    let contextMenu = document.getElementById('contextMenu');
    if (!e.path.includes(contextMenu)) {
        hideContextMenu();
    }

    let programMenu = document.getElementById('programMenu');
    if (!e.path.includes(programMenu) && e.target.getAttribute('class') != 'openWithButton') {
        programMenu.style.display = 'none';
    }
}


function openDir(path, pane) {
    currentFolder = new Folder(path);
    currentFolder.read()
    .then(() => {updateGuiFiles(currentFolder, pane);});
}


function goToParentDirectory(e) {
    handleClick(e);
    let newPath = pathModule.join(Tracker.folder().path, '..') ;
    Tracker.activePane.cd(newPath);
}



// opens a file in a seperate program
function openFile(rawPath) {
    if (Tracker.folder().children[pathModule.basename(rawPath)].type == 'directory') {
        openDir(rawPath);
        hideContextMenu();
        return;
    }

    // some quotes are added to deal with paths with spaces
    if (process.platform == 'win32') {
        let afterC = rawPath.substr(rawPath.indexOf('\\')+1);
        exec('start C:\\"'+afterC + '"');
    } else {
        alert('Support for your operating system isn\'t available yet');
    }
}


// the files in img folder are read into an array
// if the pictures name matches an extension, it is used.
// i.e. putting an picture called xlsx.png in the img folder
// will cause the program to use that picture as the .xlsx icon
function loadDefaultIcons() {
    let raw = fs.readdirSync(pathModule.resolve(__dirname,'img'));

    // chopping off extensions
    for (let fileName of raw) {
        let newEntry = fileName.substr(0, fileName.indexOf('.'));
        defaultIcons[newEntry] = fileName;
    }

    for (let extension of Object.keys(settings.fileTypes)) {
        defaultIcons[extension] = settings.fileTypes[extension].img;
    }
}

function injectIcons() {
    for (el of $('.fileEntry')) {
        let fileName = el.children[1].textContent;
        let img64 = currentFolder.children[fileName].img64;
        el.children[0].setAttribute('src', 'data:image/png;base64,' + img64);
    }
}

// returns the path to the file that should be used.
// settings.json can be used to set file icons
function fileIconPath(folder, fileName) {
    let fileObj = folder.children[fileName];
    let iconFileName = defaultIcons[fileObj.type];
    let iconSettings = settings.fileTypes[findFileExtension(fileName)];
    if (fileObj.img64) {
        return 'data:img/png; base64 ' + fileObj.img64;
    }
    if (iconSettings == undefined) {
        if (iconFileName == undefined) {
            return 'img/blank.png';
        } else {
            return 'img/' + iconFileName;
        }
    } else if (iconSettings.src == 'self') {
        return pathModule.join(folder.path, fileName);
    } else if (iconSettings.src == 'extract') {
        return 'data:image/png;base64,' + folder.children[fileName].img64;
    } else {
        return 'img/' + iconFileName;
    }
}

function extractIconFromFile(pathToFile, img) {
    return new Promise(function(resolve, reject) {
        iconExtractor.getIcon(null, pathToFile);
    });
}

function clearSelectedFiles() {
    let fileList_uls = document.getElementsByClassName('fileList');

    for (fileList_ul of fileList_uls) {
        // reset color of files in browser
        for (li of fileList_ul.children) {
            li.style.backgroundColor = '';
        }
    }
    selectedFiles.tentative = new Array();
}

// reloads the page with any file changes
function refresh() {

    for (fileField of document.getElementsByClassName('fileField')) {
        let domTraverser = new Active(fileField);
        let newFolder = new Folder(domTraverser.inputBox().value);
        newFolder.read()
        .then(() => {updateGuiFiles(newFolder, domTraverser.fileList())})
    }
}


// function to make a new folder or file
// makeDir should be boolean that is true if creating folder, false if creating file
function createNewChild(makeDir) {
    console.log(makeDir);
    let fileList = active.fileList();
    let inputEl = newInputBox();
    inputEl.setAttribute('id', 'newFileInput');

    inputEl.addEventListener('keypress', function (e) {
        let keyPressed = e.which;
        if (keyPressed == 13) {
            let userInput = inputEl.value;

            if (makeDir && !fs.existsSync()) {
                fs.mkdirSync(userInput);
            } else {
                fs.writeFile(userInput, '', () => {});
            }

            refresh();
        }
    }, false);

    // if inputEl loses focus, cancel the creation of new file
    inputEl.addEventListener('blur', () => { inputEl.style.display = 'none' }, false);


    fileList.prepend(inputEl);
    inputEl.focus();
}


// there's no recovering deleted files.
//Maybe I could find path to trash but this is different for each OS
// Maybe I could create my own trash folder
function deleteFile() {
    console.log(selectedFileNames());
    for (let fileName of selectedFileNames()) {
        if (currentFolder.children[fileName].isDirectory()) {
            fs.rmdir(fileName, printError);
        } else {
            fs.unlink(fileName, printError);
        }
    }
    refresh();
    hideContextMenu();
}

// goes through selectedFiles and grabs just
// the li elements and returns them in an array
function selectedFileNames() {
    let toReturn = new Array();
    for (let obj of selectedFiles.tentative) {
        console.log(obj);
        toReturn.push(obj.li.children[1].textContent);
    }
    return toReturn;
}

// usually results in contextMenu being shown
function fileRightClicked(e) {
    //console.log(e);
    if (!e.ctrlKey && selectedFiles.tentative.length == 1) {
        clearSelectedFiles();
    }
    // 'this' is the li element
    selectFile(this);

    showContextMenu(e);

    console.log(selectedFiles);
}




// creates input box, waits for user to enter new name or click elsewhere
function renameFiles() {
    hideContextMenu();
    let oldName = selectedFileNames()[0];

    // creating input box
    let inputBox = document.createElement('input');
    inputBox.setAttribute('type', 'text');
    inputBox.setAttribute('id', 'renameBox');

    // when user presses enter in the input box, the file will renamed
    inputBox.addEventListener('keypress', (e) => {

        // did user press enter?
        let keyPressed = e.which || e.keyCode;
        if (keyPressed == 13) { // enter pressed

            // get new name, rename file and refresh
            let newName = inputBox.value;

            fs.rename(currentFolder.path + '/' + oldName, currentFolder.path + '/' + newName, (error) => {
                if (error) {
                    console.log(error);
                    alert('failed to rename file')
                }
                refresh();
                clearSelectedFiles();
            }); // end of fs.rename callback
        }// end of if
    }, false); // end of keypress callback

    // if user clicks elsewhere, replace the input box with old name
    inputBox.addEventListener('blur', () => { li.children[1].innerHTML = oldName }, false);


    // showing the input box
    let li = selectedFiles.tentative[0].li;
    li.children[1].innerHTML = '';
    li.children[1].appendChild(inputBox);
    inputBox.focus();

} // end of rename sequence


// these files will be highlighted and held as global variables
// for future use. i.e. copy, paste
function selectFile(li_target) {

    // get li target as e.target could be child element of path

    li_target.style.backgroundColor = 'rgb(35, 219, 220)';

    let path = currentFolder.path + '\\' + nameFromLi(li_target);

    selectedFiles.addTentative(path, li_target);
}


function pasteSelectedFiles() {
    // can't paste if files haven't been copied
    if (!selectedFiles.pendingAction) {
        return;
    }


    for (selectedFile of selectedFiles.locked) {
        let fileName = pathModule.basename(selectedFile.path);

        // cut or copy depending on previous selection
        if (selectedFiles.pendingAction == 'cut') {
            fs.rename(selectedFile.path, pathModule.join(currentFolder.path, fileName), printError ); // end of callback and fs.rename
        } else if (selectedFiles.pendingAction == 'copy') {
            fs.copyFile(selectedFile.path, pathModule.join(currentFolder.path, fileName), printError);
        }
    } // end of for loop



    pendingAction = null;
    //refresh();
}




// called by the tab
function changeTab(e) {
    Tracker.activePane.setActiveTab(this);
    Tracker.refresh();
}



function addTab(e) {
    handleClick(e);

    // navigate to the tabBar with all the tabs in it
    // create new tab
    let newTab = $(templates).find('.tab')[0].cloneNode(true);
    newTab.addEventListener('click', changeTab, false);

    // add tab button must stay on the right
    let tabBar = $(Tracker.activePane.fileField).find('.tabBar')[0];
    let path = Tracker.folder().path;
    Tracker.activePane.tabs.push(new Tab(path, newTab));
    Tracker.activePane.setActiveTab(newTab);
    tabBar.insertBefore(newTab, e.target);
    Tracker.refresh();
}


function eraseTab(e) {
    handleClick(e);
    Tracker.removeTab.bind(PaneTabTracker)(e);
    if (Tracker.activePane.tabs.length <= 0) {
        let elementToDelete = Tracker.activePane.fileField;
        elementToDelete.parentNode.removeChild(elementToDelete);
    }
}


function loadExternalPrograms() {
    let programEl = document.getElementsByClassName('programList')[0];
    for (program in settings.programs) {
        programEl.innerHTML += '<div>' + program + '</div>';

    }
    programEl.addEventListener('click', startProgram, false);
}


function startProgram(event) {
    // get program object from settings.json
    let programName = event.target.textContent;
    let program = settings.programs[programName];

    // figure out file or folder to open
    let fileOrFolderPath = selectedFiles.tentative[0].path;
    let filePath = null;
    let folderPath = null;
    if (!fileOrFolderPath) {
        folderPath = currentFolder.path;
    } else if (fs.statSync(fileOrFolderPath).isDirectory()) {
        folderPath = fileOrFolderPath;
    } else if (fs.statSync(fileOrFolderPath).isFile()) {
        filePath = fileOrFolderPath;
    }


    // only open program if it can open that folder
    if (folderPath && program.canOpenFolder) {
        runExtProgram(program.path, folderPath);
    } else if (filePath && program.canOpenFile) {
        runExtProgram(program.path, filePath);
    }



}


function runExtProgram(programPath, fileOrFolderPath) {
    if (fileOrFolderPath) {
        console.log(' "' + programPath + '" "' + fileOrFolderPath + '"');
        exec(' "' + programPath + '" "' + fileOrFolderPath + '"', null);
    } else {
        exec('program.path');
    }
}


function homePath() {
    if (settings.homeFolder == undefined) {
        return os.homedir();
    } else {
        return settings.homeFolder
    }
}
