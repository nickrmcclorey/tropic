const { exec } = require('child_process');
const fs = require('fs');
const pathModule = require('path');
const sudo = require('sudo-prompt');

import { adjustFileFieldParentCss, hideContextMenu, updatePaneStyling } from "./updater.js"
import Tab from "./PaneTracking/Tab.ts";
import File from "./PaneTracking/File.ts"
import { saveSettingsToFile } from "./iconSettings"
import { createErrorToast } from "./toast.ts"

function handleClick(e) {
    for (let fileField of document.getElementsByClassName('fileField')) {
        if (e.composedPath().includes(fileField) && Tracker.activePane.fileField != fileField) {
            for (let pane of Tracker.panes) {
                if (pane.fileField == fileField) {
                    Tracker.activePane = pane;
                    updatePaneStyling();
                }
            }
        }
    }

    let contextMenu = document.getElementById('contextMenu');
    if (!e.composedPath().includes(contextMenu)) {
        hideContextMenu();
    }

    let programMenu = document.getElementById('programMenu');
    if (!e.target.classList.contains('openWithButton')) {
        programMenu.style.display = 'none';
    }

    let locationMenu = document.getElementsByClassName('locationList')[0];
    if (!e.composedPath().includes(locationMenu) && !e.target.classList.contains('locations')) {
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
    let iconSettings = settings.fileTypes[File.fileExtension(fileName)];

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


function useAsHome() {
    if (selectedFiles.tentative[0] && selectedFiles.tentative[0].isDirectory) {
        settings.homeFolder = selectedFiles.tentative[0].path;
    } else if (selectedFiles.tenative[0] == undefined) {
        settings.homeFolder = Tracker.currentFolder().path
    }
    saveSettingsToFile();
    hideContextMenu();
}


//TODO: move some of this logic to PaneTracking module
// called by the tab
function changeTab(e) {
    if (e.target.classList.contains('label')) {
        handleClick(e);
        Tracker.activePane.setActiveTab(this);
        Tracker.refresh();
    }
}


function addTab(e) {
    handleClick(e);

    // navigate to the tabBar with all the tabs in it
    // create new tab
    let newTab = document.getElementById('templates').getElementsByClassName('tab')[0].cloneNode(true);
    newTab.addEventListener('click', changeTab, false);

    // add tab button must stay on the right
    let tabBar = Tracker.activePane.fileField.getElementsByClassName('tabBar')[0];
    let path = Tracker.folder().path;
    Tracker.activePane.tabs.push(new Tab(path, newTab));
    Tracker.activePane.setActiveTab(newTab);
    tabBar.insertBefore(newTab, e.target);
    Tracker.refresh();
}


function eraseTab(e) {
    handleClick(e);
    Tracker.removeTab(e)
    if (Tracker.activePane.tabs.length <= 0) {
        let elementToDelete = Tracker.activePane.fileField;
        elementToDelete.parentNode.removeChild(elementToDelete);
        Tracker.activePane = Tracker.panes[0];
    }
    adjustFileFieldParentCss();
}



export {
    useAsHome,
    handleClick,
    loadExternalProgramList,
    fileIconPath,
    goToParentDirectory,
    clearSelectedFiles,
    loadLocations,
    addTab,
    eraseTab,
    changeTab
};

