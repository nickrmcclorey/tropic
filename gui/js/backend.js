const { exec } = require('child_process');
const fs = require('fs');
const pathModule = require('path');
const AdmZip = require('adm-zip');
const sudo = require('sudo-prompt');

import { hideContextMenu, newInputBox, updatePaneStyling } from "./updater.js"
import { fileExtension, printError } from "./pure.ts"
import SystemI from "./SystemI.ts"
import { saveSettingsToFile } from "./iconSettings"
import { createErrorToast } from "./toast.ts"

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
    if (!e.target.classList.contains('openWithButton')) {
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
    handleClick(e);
    let newPath = pathModule.join(Tracker.folder().path, '..');
    Tracker.activePane.cd(newPath);
}


// opens a file in a seperate program
function openFile(rawPath) {
    hideContextMenu();

    if (Tracker.folder().children[pathModule.basename(rawPath)].isDirectory == 'directory') {
        Tracker.activePane.cd(rawPath);
    } else {
        SystemI.instance.openFile(rawPath);
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

            let newPathToCreate = pathModule.join(Tracker.folder().path, userInput);
            if (makeDir && !fs.existsSync(newPathToCreate)) {
                // TODO: This doesn't seem like good exception handling
                try {
                    fs.mkdirSync(newPathToCreate);
                } catch (exception) {
                    console.log(exception.code)
                    if (exception.code == 'EACCES') {
                        sudoMkdir(newPathToCreate);
                    }
                }
            } else if (!fs.existsSync(newPathToCreate)) {
                fs.writeFile(newPathToCreate, '', error => {
                    if (error?.code == 'EACCES') {
                        console.log("don't have permissions to write here")
                        createErrorToast("File Access Error: Insufficient permissions")
                    }
                });
            }

            Tracker.refresh();
        }
    }, false);

    // if inputEl loses focus, cancel the creation of new file
    inputEl.addEventListener('blur', () => { inputEl.style.display = 'none' }, false);
    fileList.insertBefore(inputEl, fileList.children[1]);
    inputEl.focus();
}

function sudoMkdir(folderPath) {
    var options = {
        name: 'Tropic',
    };
    sudo.exec('mkdir "' + folderPath + '"', options,
        (error, stdout, stderr) => {
            if (error) {
                console.log(error)
                createErrorToast("Permission Denied")
            }
        }
    );
}


// uses executable that recycles files
async function deleteFile() {
    hideContextMenu();
    await SystemI.instance.deleteFiles(selectedFiles.tentativePaths())
    Tracker.refresh()
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


async function pasteSelectedFiles() {
    // can't paste if files haven't been copied
    if (!selectedFiles.pendingAction) {
        return;
    }

    let promises = [];
    let sudoFiles = [];
    for (let selectedFile of selectedFiles.locked) {
        let fileName = pathModule.basename(selectedFile.path);

        let destination = '';
        destination = pathModule.join(Tracker.folder().path, fileName);

        let action = null;
        // cut or copy depending on previous selection
        if (selectedFiles.pendingAction == 'cut') {
            action = fs.rename
        } else if (selectedFiles.pendingAction == 'copy') {
            action = fs.copyFile
        } else {
            continue;
        }

        promises.push(new Promise((resolve, reject) => {
            action(selectedFile.path, destination, (e) => {
                if (e) {
                    // If we don't have adequate file permissions, we'll save this file and try with sudo later
                    if (e.code == 'EACCES') {
                        sudoFiles.push(selectedFile.path)
                        resolve()
                    } else {
                        reject(e);
                    }
                } else {
                    resolve();
                }
            })
        }))
    } // end of for loop

    await Promise.all(promises)
    if (sudoFiles.length > 0) {
        let destination = Tracker.folder().path
        let command = '';
        if (selectedFiles.pendingAction == 'cut') {
            command = SystemI.instance.moveCommand(sudoFiles, destination, false)
        } else if (selectedFiles.pendingAction == 'copy') {
            command = SystemI.instance.copyCommand(sudoFiles, destination, false)
        } else {
            return;
        }

        try {
            await sudoExec(command)
        } catch (error) {
            console.error('command used: ' + command)
            console.error(error)
            createErrorToast("Couldn't copy one or more files")
        }
    }

    Tracker.refresh()
    selectedFiles.pendingAction = null
}

function sudoExec(command) {
    const options = {
        name: "Tropic"
    }

    return new Promise((resolve, reject) => {
        sudo.exec(command, options, 
            (error, stdout, stderr) => {
                if (error) {
                    reject(error)
                }

                resolve();
            }
        )
    })
}


function loadExternalProgramList() {
    let programEl = document.getElementsByClassName('programList')[0];
    for (let program in settings.programs) {
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
    pasteSelectedFiles,
    unzip,
    zip,
    addPicToFileIcons,
    useAsHome,
    handleClick,
    loadExternalProgramList,
    fileIconPath,
    goToParentDirectory,
    clearSelectedFiles,
    loadLocations,
    createNewChild
};

