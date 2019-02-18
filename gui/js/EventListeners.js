function setFileListListeners() {

    // button to go to parent directory
    for (el of $('.backButton')) {
        el.addEventListener('click', goToParentDirectory, false);
    }
    // user entered path into path box
    for (el of $('.pathBox')) {
        el.addEventListener('keypress', pathBoxKeyDown, false);
    }

    for (pane of $('fileField')) {
        pane.addEventListener('click', (e) => {
            if (e.target.getAttribute('class') == 'fileField') {
                clearSelectedFiles();
            }
        }, false);
    }

    for (let filebar of $('.fileEntry')) {
        // open file on double click
        filebar.addEventListener('dblclick', file_dbl_clicked, false);
        // file selected
        filebar.addEventListener('click', fileClicked, false);
        // file right clicked, open contextMenu
        filebar.addEventListener('contextmenu', fileRightClicked, false);
    }

    for (el of document.getElementsByClassName('addTabButton')) {
        el.addEventListener('click', addTab, false);
    }

    for (el of document.getElementsByClassName('xButton')) {
        el.addEventListener('click', eraseTab, false);
    }

    for (el of document.getElementsByClassName('tab')) {
        el.addEventListener('click', changeTab, false);
    }
}


function setInitListeners() {
    // hide right click menu whne user clicks elsewhere
    // document.addEventListener('click', handleClick, false);

    // rename buttons
    for (el of document.getElementsByClassName('renameButton')) {
        el.addEventListener('click', renameFiles, false);
    }
    // delete button
    for (el of document.getElementsByClassName('deleteButton')) {
        el.addEventListener('click', deleteFile,false);
    }
    // copy button
    for (el of document.getElementsByClassName('copyButton')) {
        el.addEventListener('click', () => { selectedFiles.lockSelection('copy'); hideContextMenu();},false);
    }
    // cut button
    for (el of document.getElementsByClassName('cutButton')) {
        el.addEventListener('click', () => { selectedFiles.lockSelection('cut'); hideContextMenu();},false);
    }
    // paste buttons
    for (el of document.getElementsByClassName('pasteButton')) {
        el.addEventListener('click', pasteSelectedFiles, false);
    }
    // open a file or folder
    for (el of document.getElementsByClassName('openButton')) {
        el.addEventListener('click', () => {openFile(pathModule.join(Tracker.folder().path, nameFromLi(selectedFiles.tentative[0].li)))},false);
    }

    // ask what they want to open with
    for (el of document.getElementsByClassName('openWithButton')) {
        el.addEventListener('click', openProgramList, false);
    }

    // unzip selected file
    for (el of document.getElementsByClassName('unzipButton')) {
        el.addEventListener('click', unzip, false);
    }

    // zip selected file
    for (el of document.getElementsByClassName('zipButton')) {
        el.addEventListener('click', zip, false);
    }

    // shows more options in the context menu
    for (el of document.getElementsByClassName('moreButton')) {
        el.addEventListener('click', expandContextMenu, false);
    }

    // opens up the menu under the "jump" button to show shortcuts to file locations
    for (el of document.getElementsByClassName('locations')) {
        el.addEventListener('click', openLocationList, false);
    }

    // opens a new pane next to the current one
    for (el of document.getElementsByClassName('newPaneButton')) {
        el.addEventListener('click', () => {
            Tracker.addPane(homePath());
        }, false);
    }

    // add image to the list of available file icons
    for (el of $('.addToFileIcons')) {
        el.addEventListener('click', addPicToFileIcons, false);
    }

    for (el of $('.addToLocations')) {
        el.addEventListener('click', addFolderToLocations, false);
    }

    document.addEventListener('click', handleClick, false);

    document.getElementsByClassName('newDirButton')[0].addEventListener('click', () => {createNewChild(true)})
    document.getElementsByClassName('newFileButton')[0].addEventListener('click', () => {createNewChild(false)}, false);
}

