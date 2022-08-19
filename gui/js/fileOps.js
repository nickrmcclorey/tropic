const fs = require('fs');
const pathModule = require('path');
const AdmZip = require('adm-zip');
const sudo = require('sudo-prompt');

import { hideContextMenu, newInputBox } from "./updater.js"
import { createErrorToast } from "./toast.ts"
import SystemI from "./System/SystemI"


// opens a file in a seperate program
function openFile(rawPath) {
    hideContextMenu();

    if (Tracker.folder().children[pathModule.basename(rawPath)]?.isDirectory == 'directory') {
        Tracker.activePane.cd(rawPath);
    } else {
        SystemI.instance.openFile(rawPath);
    }
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
                        createErrorToast("Folder Access Error: Insufficient permissions")
                    } else if (error) {
                        createErrorToast("Failed to write file")
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

// uses executable that recycles files
async function deleteFile() {
    hideContextMenu();
    try {
        await SystemI.instance.deleteFiles(selectedFiles.tentativePaths())
    } catch (error) {
        console.log(error)
        createErrorToast("Failed to delete file")
    }
    
    Tracker.refresh()
}



// creates input box, waits for user to enter new name or click elsewhere
function renameFile() {
    hideContextMenu();
    let fileToRename = selectedFiles.tentative[0];

    // creating input box
    let inputBox = document.createElement('input');
    inputBox.setAttribute('type', 'text');
    inputBox.setAttribute('id', 'renameBox');

    // when user presses enter in the input box, the file will renamed
    inputBox.addEventListener('keypress', async (e) => {

        // did user press enter?
        let keyPressed = e.which || e.keyCode;
        if (keyPressed == 13) { // enter pressed

            // get new name, rename file and refresh
            let newName = inputBox.value;

            let destination = pathModule.join(Tracker.folder().path, newName)
            try {
                await moveFile(fileToRename.path, destination)
            } catch {
                createErrorToast("Failed to rename file")
            }

            Tracker.refresh();
            clearSelectedFiles();
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

function moveFile(src, dest) {
    return new Promise((resolve, reject) => {
        fs.rename(src, dest, (error) => {
            if (error) {
                console.log(error);
                reject(); // TODO: remove when we filter error to permission error
                let command = SystemI.instance.moveCommand(src, dest)
                sudo.exec(command, { name: "Tropic" }, (error, stdout, stderr) => {
                    if (error) {
                        reject(error);
                    }

                    resolve();
                })
            }
            resolve()
        });
    })

}


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

function unzip() {
    let newFilename = pathModule.basename(selectedFiles.tentative[0].path).replace('.zip', '');
    let newPath = pathModule.join(Tracker.folder().path, newFilename);
    try { 
        let zip = new AdmZip(selectedFiles.tentative[0].path);
        zip.extractAllTo(newPath, false);
    } catch (e) {
        console.log(e)
        createErrorToast("Failed to unzip file")
    }
    hideContextMenu();
    Tracker.activePane.refresh();
}


function zip() {
    try {
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
    } catch (e) {
        console.log(e)
        createErrorToast("Failed to create zip archive")
    }

    hideContextMenu();
    Tracker.activePane.refresh();
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


export {
    renameFile,
    deleteFile,
    pasteSelectedFiles,
    unzip,
    zip,
    addPicToFileIcons,
    openFile,
    createNewChild
}