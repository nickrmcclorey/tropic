// Nicholas McClorey - 7/30/2018
// Nicholas McClorey - 1/16/2020

const pathModule = require("path")

import { fileIconPath, clearSelectedFiles } from "./backend.js"
import { setFileListListeners } from "./EventListeners.js"

// updates the display with the list of files and their relavant information
function updateGuiFiles(folderObj, pane) {
    // if pane is not passed in, we stick with the active pane (selectedFileList)
    let fileList = null;
    if (pane) {
        fileList = pane.fileList;
    } else {
        pane = Tracker.activePane;
        fileList = Tracker.activePane.fileList;
    }

    // update the input path box to show current path
    pane.pathBox.value = folderObj.path;

    // wipe the list of files because we just changed directories
    if (Object.keys(folderObj.children).length == 0) {
        fileList.innerHTML = "<li><span></span><span>Folder is empty</span></li>";    
    } else {
        fileList.innerHTML = '<li><span></span><span>Name</span><span>Size</span></li>';
    }

    // folderObj.children is an associative array indexed by strings corresponding to the files' names
    for (let fileName in folderObj.children) {
        // this will be one row in the file list
        let file_li = document.createElement('li');
        file_li.setAttribute('class', 'fileEntry');

        // icon of file
        let img = document.createElement('img');
        img.setAttribute('src', fileIconPath(folderObj, fileName));
        img.setAttribute('id', folderObj.children[fileName].id)

        // name of file
        let spanName = document.createElement('span');
        spanName.appendChild(document.createTextNode(fileName));

        // size of file - set to 'folder' if entry is directory
        let spanFileSize = document.createElement('span');
        if (folderObj.children[fileName].isDirectory()) {
                spanFileSize.appendChild(document.createTextNode('directory'));
        } else {
            // appending a textNode showing the size of the file
            spanFileSize.appendChild(document.createTextNode(folderObj.children[fileName].size));
        }

        // appending all the elements to the <li> bar
        file_li.appendChild(img);
        file_li.appendChild(spanName);
        file_li.appendChild(spanFileSize);

        // append <li> to the list
        fileList.appendChild(file_li);

        // provide pointer to element so we can append the correct icon later on
        if (folderObj.children[fileName].imgPromise) {
            folderObj.children[fileName].element = file_li;
        }

    }// end of for loop


    let tab = pane.activeTab.element;
    tab.path = folderObj.path;
    let label = pathModule.basename(folderObj.path);
    // tab's label is the basename or the path if in root folder
    tab.getElementsByClassName('label')[0].innerHTML = (label == '') ? folderObj.path : label;
	try {
    highlightTabs();
    setFileListListeners();
	console.log('set file listeners')
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


// usually results in contextMenu being shown
function fileRightClicked(e) {
    if (!e.ctrlKey && selectedFiles.tentative.length == 1) {
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
    } else if (!e.ctrlKey) {
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
		el.setAttribute('hidden', 'hidden')
	}

    document.getElementById('contextMenu').style.display = 'none';
    document.getElementsByClassName('unzipButton')[0].setAttribute('hidden', true);
}


function showContextMenu(e) {
    if (selectedFiles.tentative[0] && fileExtension(selectedFiles.tentative[0].path) == 'zip') {
        $('.unzipButton').removeAttr('hidden');
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


// returns number of tabs in a specific tabBar
function numTabs(tabBar) {
    let numTabs = 0;
    for (let tab of tabBar.children) {
        if (tab.className == 'tab') {
            numTabs++;
        }
    }
    return numTabs;
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
    let list = $('.programList')[0];
    let openButton = e.target;
    pinUnderElement(openButton, list);
}


function openLocationList(e) {
    let menu = $('.locationList')[0];
    let openButton = e.target;
    pinUnderElement(openButton, menu, 'grid');
}


function pinUnderElement(element, menu, newDisplay='block') {
    let location = element.getBoundingClientRect();
    menu.style.left = location.x + 'px';
    menu.style.top = location.bottom + 'px';
    $(element).removeAttr('hidden');
    menu.style.display = newDisplay;
}


function expandContextMenu() {
    $('.contextMenu').find('.more').show();
    $('.contextMenu').find('.moreButton').hide();
}


function addFolderToLocations() {
    console.log(selectedFiles.tentative);
    let fileSelected = selectedFiles.tentative[0];
    let newBookmarkPath = (fileSelected.isDirectory) ? fileSelected.path : Tracker.folder().path;
    let label = pathModule.basename(newBookmarkPath);

    settings.locations[label] = newBookmarkPath;
    saveSettingsToFile();

    $('.locationList')[0].innerHTML = '';
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
	fileRightClicked
}

export {
    openProgramList,
    expandContextMenu,
    openLocationList,
    addFolderToLocations,
	updateGuiFiles,
	hideContextMenu,
	pathBoxKeyDown,
	file_dbl_clicked,
	callbacks
}
