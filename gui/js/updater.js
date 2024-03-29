// Nicholas McClorey - 7/30/2018
// Nicholas McClorey - 1/16/2020
// Nicholas McClorey - 8/14/2022

const pathModule = require("path")
const fs = require("fs")

import { fileIconPath, clearSelectedFiles, handleClick } from "./backend.js"
import { setFileListListeners } from "./EventListeners.js"
import { nameFromLi } from "./pure.ts"
import File from "./PaneTracking/File"
import { openFile } from "./fileOps.js"
import SystemI from "./System/SystemI.ts"

// updates the display with the list of files and their relavant information
function updateGuiFiles(pane) {
    let folder = pane.activeTab.folder
    let fileList = pane.fileList;

    // update the input path box to show current path
    pane.pathBox.value = folder.path;

    // wipe the list of files because we just changed directories
    if (Object.keys(folder.children).length == 0) {
        fileList.innerHTML = "<li><span></span><span>Folder is empty</span></li>";    
    } else {
        fileList.innerHTML = '<li><span></span><span>Name</span><span>Size</span></li>';
    }

    // folder.children is an associative array indexed by strings corresponding to the files' names
    for (let fileName in folder.children) {

        if (!settings.showHiddenFiles && fileName.startsWith('.')) {
            continue;
        }

        // this will be one row in the file list
        let file_li = document.createElement('li');
        file_li.setAttribute('class', 'fileEntry');

        // icon of file
        let img = document.createElement('img');
		try {
			img.setAttribute('src', fileIconPath(folder, fileName));
		} catch (e) {
			console.error (e)
		}
        img.setAttribute('id', folder.children[fileName].id)

        // name of file
        let spanName = document.createElement('span');
        spanName.appendChild(document.createTextNode(fileName));

        // size of file - set to 'folder' if entry is directory
        let spanFileSize = document.createElement('span');
        if (folder.children[fileName].isDirectory()) {
                spanFileSize.appendChild(document.createTextNode('directory'));
        } else {
            // appending a textNode showing the size of the file
            spanFileSize.appendChild(document.createTextNode(folder.children[fileName].size));
        }

        // appending all the elements to the <li> bar
        file_li.appendChild(img);
        file_li.appendChild(spanName);
        file_li.appendChild(spanFileSize);

        // append <li> to the list
        fileList.appendChild(file_li);

        // provide pointer to element so we can append the correct icon later on
        if (folder.children[fileName].imgPromise) {
            folder.children[fileName].element = file_li;
        }

    }// end of for loop


    let tab = pane.activeTab.element;
    tab.path = folder.path;
    let label = pathModule.basename(folder.path);
    // tab's label is the basename or the path if in root folder
    tab.getElementsByClassName('label')[0].innerHTML = (label == '') ? folder.path : label;
	try {
    highlightTabs();
    setFileListListeners();
    appendExeIcons(pane);
	} catch (e) {console.log(e)}
}


function appendExeIcons(pane) {
    for (let key of Object.keys(pane.activeTab.folder.children)) {
        let child = pane.activeTab.folder.children[key];
        if (child.element) {
            child.imgPromise.then((img64Object) => {
                child.element.children[0].setAttribute('src', 'data:image/png;base64, ' + img64Object.img64);
            });
        }
    }
}


// called by event listener of the li. opens a file or folder
function file_dbl_clicked(e) {
    handleClick(e);

    let selectedFile = nameFromLi(this);
    let newPath = pathModule.join(Tracker.folder().path, selectedFile);

    if (Tracker.folder().children[selectedFile].type == 'directory') {
        Tracker.activePane.cd(newPath);
    } else {
        openFile(newPath);
    }
}


// these files will be highlighted and held as global variables
// for future use. i.e. copy, paste
function selectFile(li_target) {

    // get li target as e.target could be child element of path
    li_target.style.backgroundColor = 'rgb(35, 219, 220)';

    let path = pathModule.join(Tracker.folder().path, nameFromLi(li_target));
    let isDirectory = fs.lstatSync(path).isDirectory()

    selectedFiles.addTentative(path, isDirectory, li_target);
}


// usually results in contextMenu being shown
function fileRightClicked(e) {
    if (!SystemI.instance.isModifierKeyPressed(e) && selectedFiles.tentative.length == 1) {
        clearSelectedFiles();
    }
    // 'this' is the li element
    selectFile(this);

    showContextMenu(e);
}


// this is a callback of each li element in the file list
function fileClicked(e) {
    handleClick(e);

    // 'this' will be the li element
    if (selectedFiles.tentativeContains(this)) {
        selectedFiles.tentativeRemove(this);
        return;
    } else if (!SystemI.instance.isModifierKeyPressed(e)) {
        clearSelectedFiles();
    }

    selectFile(this);
}


function hideContextMenu() {
    let elements = document.getElementsByClassName('contextMenu')[0].getElementsByClassName('more')
	for (let el of elements) {
		el.setAttribute('hidden', 'hidden')
	}

    elements = document.getElementsByClassName('contextMenu')[0].getElementsByClassName('moreButton')
	for (let el of elements) {
		el.removeAttribute('hidden');
	}

    document.getElementById('contextMenu').style.display = 'none';
    document.getElementsByClassName('unzipButton')[0].setAttribute('hidden', true);
}


function showContextMenu(e) {
    if (selectedFiles.tentative[0] && File.fileExtension(selectedFiles.tentative[0].path) == 'zip') {
		for (let el of document.getElementsByClassName('unzipButton')) {
			el.removeAttribute('hidden')
		}
    }

    let contextMenu = document.getElementById('contextMenu');
    if (e) {
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY - 15 + 'px';
        contextMenu.style.display = 'block';
    }
}


// called by path box near top of page
// navigates the browser to the path typed in the box at top of page
function pathBoxKeyDown(e) {
    let keyPressed = e.which;
    if (keyPressed === 13) { // enter button
        handleClick(e);
        Tracker.activePane.cd(this.value);
    }
}


// used when creating new file or folder
function newInputBox() {
    let inputBox = document.createElement('input');
    inputBox.setAttribute('type', 'text');
    return inputBox;

}


// active tabs are a different color than the others
function highlightTabs() {
    for (let el of document.getElementsByClassName('tab'))
		el.classList.remove('activeTab')

    for (let pane of Tracker.panes)
        pane.activeTab.element.classList.add('activeTab')
}


function adjustFileFieldParentCss() {
    let fields = document.getElementsByClassName('fileFieldParent')[0];
    // using css grid to evenly space the fileFields
    let gridTemplateColumns = '';
    for (let k = 0; k < Tracker.panes.length; k++) {
        // 1fr for each child of fileFieldParent
        gridTemplateColumns += ' 1fr';
    }
    // set the css grid value for grid-template-columns
    fields.style.gridTemplateColumns = gridTemplateColumns;

    // activate buttons on new element
    setFileListListeners();
    updatePaneStyling();
}


function openProgramList(e) {
    let list = document.getElementsByClassName('programList')[0];
    console.log(list.getAttribute('hidden'))
    let openButton = e.target;
    pinUnderElement(openButton, list, 'block');
}


function openLocationList(e) {
    console.log('location')
    let menu = document.getElementsByClassName('locationList')[0];
    let openButton = e.target;
    pinUnderElement(openButton, menu, 'grid');
}


function pinUnderElement(element, menu, newDisplay='block') {
    let location = element.getBoundingClientRect();
    menu.style.left = location.x + 'px';
    menu.style.top = location.bottom + 'px';
    element.removeAttribute('hidden');
    menu.removeAttribute('hidden')
    menu.style.display = 'block'
}


function expandContextMenu() {
	for (let el of document.getElementsByClassName('more'))
		el.removeAttribute('hidden')

	let el = document.getElementsByClassName('moreButton')[0]
	el.setAttribute('hidden', true);
}


function addFolderToLocations() {
    console.log(selectedFiles.tentative);
    let fileSelected = selectedFiles.tentative[0];
    let newBookmarkPath = (fileSelected.isDirectory) ? fileSelected.path : Tracker.folder().path;
    let label = pathModule.basename(newBookmarkPath);

    settings.locations[label] = newBookmarkPath;
    saveSettingsToFile();

    document.getElementsByClassName('locationList')[0].innerHTML = '';
    loadLocations();
    hideContextMenu();
}


function updatePaneStyling() {
    for (let pane of Tracker.panes) {
        pane.fileField.classList.remove('activeField');
    }
    Tracker.activePane.fileField.classList.add('activeField');
}

const callbacks = {
	fileClicked,
	fileRightClicked,
	file_dbl_clicked,
	expandContextMenu,
	openLocationList,
    openProgramList,
	addFolderToLocations,
	pathBoxKeyDown
}

export {
	hideContextMenu,
	updateGuiFiles,
    callbacks,
    newInputBox,
    updatePaneStyling,
    adjustFileFieldParentCss
}

