import { renameFiles, deleteFile, pasteSelectedFiles, unzip, zip, addPicToFileIcons, useAsHome, handleClick, goToParentDirectory, clearSelectedFiles } from "./backend.js"
import { callbacks, openProgramList, expandContextMenu, openLocationList, addFolderToLocations, pathBoxKeyDown, file_dbl_clicked } from "./updater.js"
import { addTab, eraseTab, changeTab } from "./Tab.js"


function setFileListListeners() {

    // button to go to parent directory
    for (let el of document.getElementsByClassName('backButton'))
        el.addEventListener('click', goToParentDirectory, false);

    // user entered path into path box
    for (let el of document.getElementsByClassName('pathBox'))
        el.addEventListener('keypress', pathBoxKeyDown, false);

    for (let pane of document.getElementsByClassName('fileField')) {
        pane.addEventListener('click', (e) => {
            if (e.target.getAttribute('class') == 'fileField') {
                clearSelectedFiles();
            }
        }, false);
    }

    for (let filebar of document.getElementsByClassName('fileEntry')) {
        // open file on double click
        filebar.addEventListener('dblclick', file_dbl_clicked, false);
        // file selected
        filebar.addEventListener('click', callbacks.fileClicked, false);
        // file right clicked, open contextMenu
        filebar.addEventListener('contextmenu', callbacks.fileRightClicked, false);
    }

    for (let el of document.getElementsByClassName('addTabButton'))
        el.addEventListener('click', addTab, false);

    for (let el of document.getElementsByClassName('xButton'))
        el.addEventListener('click', eraseTab, false);

    for (let el of document.getElementsByClassName('tab'))
        el.addEventListener('click', changeTab, false);
}


function setInitListeners() {
    // hide right click menu whne user clicks elsewhere
    // document.addEventListener('click', handleClick, false);

    // rename buttons
    for (let el of document.getElementsByClassName('renameButton')) {
        el.addEventListener('click', renameFiles, false);
    }
    // delete button
    for (let el of document.getElementsByClassName('deleteButton')) {
        el.addEventListener('click', deleteFile,false);
    }
    // copy button
    for (let el of document.getElementsByClassName('copyButton')) {
        el.addEventListener('click', () => { selectedFiles.lockSelection('copy'); hideContextMenu();},false);
    }
    // cut button
    for (let el of document.getElementsByClassName('cutButton')) {
        el.addEventListener('click', () => { selectedFiles.lockSelection('cut'); hideContextMenu();},false);
    }
    // paste buttons
    for (let el of document.getElementsByClassName('pasteButton')) {
        el.addEventListener('click', pasteSelectedFiles, false);
    }
    // open a file or folder
    for (let el of document.getElementsByClassName('openButton')) {
        el.addEventListener('click', () => {openFile(pathModule.join(Tracker.folder().path, nameFromLi(selectedFiles.tentative[0].li)))},false);
    }

    // ask what they want to open with
    for (let el of document.getElementsByClassName('openWithButton')) {
        el.addEventListener('click', openProgramList, false);
    }

    // unzip selected file
    for (let el of document.getElementsByClassName('unzipButton')) {
        el.addEventListener('click', unzip, false);
    }

    // zip selected file
    for (let el of document.getElementsByClassName('zipButton')) {
        el.addEventListener('click', zip, false);
    }

    // shows more options in the context menu
    for (let el of document.getElementsByClassName('moreButton')) {
        el.addEventListener('click', expandContextMenu, false);
    }

    // opens up the menu under the "jump" button to show shortcuts to file locations
    for (let el of document.getElementsByClassName('locations')) {
        el.addEventListener('click', openLocationList, false);
    }

    // opens a new pane next to the current one
    for (let el of document.getElementsByClassName('newPaneButton')) {
        el.addEventListener('click', () => {
            Tracker.addPane(homePath());
        }, false);
    }

    // add image to the list of available file icons
    for (let el of document.getElementsByClassName('addToFileIcons')) {
        el.addEventListener('click', addPicToFileIcons, false);
    }

    for (let el of document.getElementsByClassName('addToLocations')) {
        el.addEventListener('click', addFolderToLocations, false);
    }

    for (let el of document.getElementsByClassName('useAsHome')) {
        el.addEventListener('click', useAsHome, false);
    }

    document.addEventListener('click', handleClick, false);
    document.addEventListener('keydown', handleKeypress, false);

    document.getElementsByClassName('newDirButton')[0].addEventListener('click', () => {createNewChild(true)})
    document.getElementsByClassName('newFileButton')[0].addEventListener('click', () => {createNewChild(false)}, false);
}

function handleKeypress(e) {
    let keyPressed = e.key.toUpperCase();

    if (e.ctrlKey) {
        if (keyPressed == 'C') {
            selectedFiles.lockSelection('copy');
        } else if (keyPressed == 'X') {
            selectedFiles.lockSelection('cut');
        } else if (keyPressed == 'V') {
            pasteSelectedFiles();
        } else if (keyPressed == 'TAB' && Tracker.activePane.tabs.length > 1) {
            let index = Tracker.activePane.tabs.indexOf(Tracker.activePane.activeTab);
            // set index to the next element, looping to 0 if necessary
            index = (Tracker.activePane.tabs.length - 1 == index) ? 0 : index + 1;
            Tracker.activePane.setActiveTab(Tracker.activePane.tabs[index].element);
            Tracker.refresh();
        } else if ((keyPressed == 'Q' && Tracker.panes.length > 1) || keyPressed == 'TAB') {
            let index = Tracker.panes.indexOf(Tracker.activePane);
            // set index to the next element, looping to 0 if necessary
            index = (Tracker.panes.length - 1 == index) ? 0 : index + 1;
            Tracker.activePane = Tracker.panes[index];
            updatePaneStyling();
        } else if (keyPressed == 'T' && !e.shiftKey) {
            $(Tracker.activePane.fileField).find('.addTabButton').click();
        } else if (keyPressed == 'T' && e.shiftKey) {
            Tracker.addPane(Tracker.folder().path);
        } else if (keyPressed == 'W' && !e.shiftKey) {
            e.preventDefault();
            Tracker.activePane.activeTab.element.children[1].click();
        }
    }
}

export {
	setInitListeners,
	setFileListListeners
}
