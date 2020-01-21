const {exec} = require('child_process');
const os = require('os');
const fs = require('fs');
const pathModule = require('path');
const fii = require('file-icon-info');
const AdmZip = require('adm-zip');
const sudo = require('sudo-prompt');

import { hideContextMenu } from "./updater.js"
import { fileExtension, printError } from "./pure.js"
import SystemI from "./SystemI.ts"

function handleClick(e) {
    for (let fileField of document.getElementsByClassName('fileField')) {
        if (e.path.includes(fileField) && Tracker.activePane.fileField != fileField) {
            for (let pane of Tracker.panes) {
                if (pane.fileField == fileField) {
                    Tracker.activePane = pane;
                    updatePaneStyling();
                }
            }
        }
    }

    let contextMenu = document.getElementById('contextMenu');
    if (!e.path.includes(contextMenu)) {
        hideContextMenu();
    }

    let programMenu = document.getElementById('programMenu');
    if (e.target.getAttribute('class') != 'openWithButton') {
        programMenu.style.display = 'none';
    }

    let locationMenu = document.getElementsByClassName('locationList')[0];
    if (!e.path.includes(locationMenu) && !e.target.classList.contains('locations')) {
        locationMenu.style.display = 'none';
    }

    if (e.target.classList.contains('fileField')) {
        clearSelectedFiles();
    }
}


function goToParentDirectory(e) {
	console.log('inside')
    handleClick(e);
    let newPath = pathModule.join(Tracker.folder().path, '..') ;
    Tracker.activePane.cd(newPath);
}


// opens a file in a seperate program
function openFile(rawPath) {
    if (Tracker.folder().children[pathModule.basename(rawPath)].type == 'directory') {
        Tracker.activePane.cd(rawPath);
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
    let raw = fs.readdirSync(pathModule.resolve('./gui/img'));

    // chopping off extensions
    for (let fileName of raw) {
        let newEntry = fileName.substr(0, fileName.indexOf('.'));
        defaultIcons[newEntry] = fileName;
    }

    for (let extension of Object.keys(settings.fileTypes)) {
        defaultIcons[extension] = settings.fileTypes[extension].img;
    }
}




function clearSelectedFiles() {
    let fileList_uls = document.getElementsByClassName('fileList');

    for (let fileList_ul of fileList_uls) {
        // reset color of files in browser
        for (let li of fileList_ul.children) {
            li.style.backgroundColor = ''
        }
    }
    selectedFiles.tentative = []
}


// function to make a new folder or file
// makeDir should be boolean that is true if creating folder, false if creating file
function createNewChild(makeDir) {
    let fileList = Tracker.activePane.fileList;
    let inputEl = newInputBox();
    inputEl.setAttribute('id', 'newFileInput');

    inputEl.addEventListener('keypress', function (e) {
        let keyPressed = e.which;
        if (keyPressed == 13) {
            let userInput = inputEl.value;

            if (makeDir && !fs.existsSync()) {
                newDirPath = pathModule.join(Tracker.folder().path, userInput);
                try {
                    fs.mkdirSync(newDirPath);
                } catch (exception) {
                    let options = {
                        name: 'Electron',
                        icns: '/Applications/Electron.app/Contents/Resources/Electron.icns', // (optional)
                    };
                    sudo.exec('mkdir "' + newDirPath + '"');
                }
            } else {
                fs.writeFile(pathModule.join(Tracker.folder().path, userInput), '', () => {});
            }

            Tracker.refresh();
        }
    }, false);

    // if inputEl loses focus, cancel the creation of new file
    inputEl.addEventListener('blur', () => { inputEl.style.display = 'none' }, false);
    fileList.insertBefore(inputEl, fileList.children[1]);
    inputEl.focus();
}


// uses executable that recycles files
function deleteFile() {
    hideContextMenu();
	getSystem().deleteFiles(selectedFiles.tentativePaths())
	Tracker.refresh()

	return
}


// creates input box, waits for user to enter new name or click elsewhere
function renameFiles() {
    hideContextMenu();
    let fileToRename = selectedFiles.tentative[0];

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

            fs.rename(fileToRename.path, pathModule.join(Tracker.folder().path, newName), (error) => {
                if (error) {
                    console.log(error);
                    alert('Failed to rename file')
                }
                Tracker.refresh();
                clearSelectedFiles();
            }); // end of fs.rename callback
        }// end of if
    }, false); // end of keypress callback

    // if user clicks elsewhere, replace the input box with old name
    inputBox.addEventListener('blur', () => { li.children[1].innerHTML = pathModule.basename(fileToRename.path) }, false);

    // showing the input box
    let li = selectedFiles.tentative[0].li;
    li.children[1].innerHTML = '';
    li.children[1].appendChild(inputBox);
    inputBox.focus();

} // end of rename sequence


function pasteSelectedFiles() {
    // can't paste if files haven't been copied
    if (!selectedFiles.pendingAction) {
        return;
    }

    for (let selectedFile of selectedFiles.locked) {
        let fileName = pathModule.basename(selectedFile.path);

        let destination = '';
        if (selectedFiles.tentative[0] && selectedFiles.tentative[0].isDirectory) {
            destination = selectedFiles.tentative[0].path;
            destination = pathModule.join(destination, fileName);
        } else {
            destination = pathModule.join(Tracker.folder().path, fileName);
        }
        
        // cut or copy depending on previous selection
        if (selectedFiles.pendingAction == 'cut') {
            fs.renameSync(selectedFile.path, destination, printError ); // end of callback and fs.rename
        } else if (selectedFiles.pendingAction == 'copy') {
            fs.copyFile(selectedFile.path, destination, printError);
        }
        setTimeout(function(){ Tracker.refresh() }, 100);
    } // end of for loop

    selectedFiles.pendingAction = null;
}


function loadExternalProgramList() {
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
    let lastSelectedFile = selectedFiles.tentative[0];
    let fileOrFolderPath = (lastSelectedFile) ? lastSelectedFile.path : Tracker.folder().path;
    let filePath = null;
    let folderPath = null;
    if (!fileOrFolderPath) {
        folderPath = currentFolder.path;
    } else if (fs.statSync(fileOrFolderPath).isDirectory()) {
        folderPath = fileOrFolderPath;
    } else if (fs.statSync(fileOrFolderPath).isFile()) {
        filePath = fileOrFolderPath;
    }

    // only open program if it can open that folder or file
    if (folderPath && program.canOpenFolder) {
        runExtProgram(program.path, folderPath);
    } else if (filePath && program.canOpenFile) {
        runExtProgram(program.path, filePath);
    }

    
}


function runExtProgram(programPath, fileOrFolderPath) {
    if (fileOrFolderPath) {
        console.log(' "' + programPath + '" "' + fileOrFolderPath + '"')
        exec(' "' + programPath + '" "' + fileOrFolderPath + '"', null);
    } else {
        exec(program.path);
    }
}


function homePath() {
    if (settings.homeFolder == undefined) {
        return os.homedir();
    } else {
        return settings.homeFolder
    }
}

// returns the path to the file that should be used.
// settings.json can be used to set file icons
function fileIconPath(folder, fileName) {
    let fileObj = folder.children[fileName];
    let iconFileName = defaultIcons[fileObj.type];
    let iconSettings = settings.fileTypes[fileExtension(fileName)];

    if (iconSettings == undefined) {
        if (iconFileName == undefined) {
            return 'img/blank.png';
        } else {
            return 'img/' + iconFileName;
        }
    } else if (iconSettings.src == 'self') {
        return pathModule.join(folder.path, fileName);
    } else {
        return 'img/' + iconFileName;
    }
}


function unzip() {
    let newFilename = pathModule.basename(selectedFiles.tentative[0].path).replace('.zip', '');
    let newPath = pathModule.join(Tracker.folder().path, newFilename);
    let zip = new AdmZip(selectedFiles.tentative[0].path);
    zip.extractAllTo(newPath, false);
    hideContextMenu();
    Tracker.activePane.refresh();
}


function zip() {
    let zip = new AdmZip();
    for (let file of selectedFiles.tentative) {
        if (file.isDirectory) {
            zip.addLocalFolder(file.path);
        } else {
            zip.addLocalFile(file.path);
        }
    }
    let zipName = pathModule.basename(selectedFiles.tentative[0].path) + ".zip"
    zip.writeZip(pathModule.join(Tracker.folder().path, zipName));
    hideContextMenu();
    Tracker.activePane.refresh();
}


function loadLocations() {
    for (let name in settings.locations) {
        let element = document.createElement('div');
        element.append(document.createTextNode(name));
		let locationList = document.getElementsByClassName('locationList')[0]
        element.addEventListener('click', () => {
            Tracker.activePane.cd(settings.locations[name]);
            locationList.style.display = 'none';
        }, false);
        locationList.appendChild(element);

        let XButton = document.createElement('div');
        XButton.appendChild(document.createTextNode('x'));
        XButton.addEventListener('click', (e) => {
            settings.locations[name] = undefined;
            saveSettingsToFile();
			let toRemove = e.target.previousSibling
			toRemove.parentNode.removeChild(toRemove)
			e.target.parentNode.removeChild(e.target)
        }, false);
        document.getElementsByClassName('locationList')[0].appendChild(XButton);
    }
}

function addPicToFileIcons() {
    let file = selectedFiles.tentative[0];
    if (!file.isDirectory) {

        let imgPath = pathModule.join(__dirname, 'img', pathModule.basename(file.path));
        if (!fs.existsSync(imgPath)) {
            fs.copyFileSync(file.path, imgPath);
        }
    }
}

function useAsHome() {
    if (selectedFiles.tentative[0] && selectedFiles.tentative[0].isDirectory) {
        settings.homeFolder = selectedFiles.tentative[0].path;
    } else if (selectedFiles.tenative[0] == undefined) {
        settings.homeFolder = Tracker.currentFolder().path
    }
    saveSettingsToFile();
    hideContextMenu();
}

var getSystem = SystemI.getCorrectSystem

const fileOps = {
	renameFiles,
	deleteFile,
	pasteSelectedFiles,
	unzip,
	zip,
	addPicToFileIcons,
	openFile
}

export {
	fileOps,
    renameFiles,
	getSystem,
    deleteFile,
    pasteSelectedFiles,
    unzip,
    zip,
    addPicToFileIcons,
    useAsHome,
    handleClick,
	loadDefaultIcons,
	loadExternalProgramList,
	fileIconPath,
	goToParentDirectory,
	clearSelectedFiles
};

