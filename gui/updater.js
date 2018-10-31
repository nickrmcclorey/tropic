// Nicholas McClorey - 7/30/2018


function setFileListListeners() {

    // button to go to parent directory
    for (el of document.getElementsByClassName('backButton')) {
        el.addEventListener('click', goToParentDirectory, false);
    }
    // user entered path into path box
    for (el of document.getElementsByClassName('pathBox')) {
        el.addEventListener('keypress', pathBoxKeyDown, false);
    }

    for (pane of document.getElementsByClassName('fileField')) {
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
    // open buttons
    for (el of document.getElementsByClassName('openButton')) {
        el.addEventListener('click', () => {openFile(pathModule.join(Tracker.folder().path, nameFromLi(selectedFiles.tentative[0].li)))},false);
    }

    for (el of document.getElementsByClassName('openWithButton')) {
        el.addEventListener('click', openProgramList, false);
    }

    for (el of document.getElementsByClassName('newFileFieldButton')) {
        el.addEventListener('click', newFileField, false);
    }

    document.addEventListener('click', handleClick, false);

    document.getElementsByClassName('newDirButton')[0].addEventListener('click', () => {createNewChild(true)})
    document.getElementsByClassName('newFileButton')[0].addEventListener('click', () => {createNewChild(false)}, false);
}

// updates the display with the list of files and their relavant information
function updateGuiFiles(folderObj, elToTarget) {

    // if elToTarget is not passed in, we stick with the active pane (selectedFileList)
    let fileList = null;
    if (elToTarget) {
        fileList = elToTarget;
    } else {
        fileList = active.fileList();
    }

    // let fileList = elToTarget;
    // update the input path box to show current path
    active.inputBox().value = folderObj.path;

    // wipe the list of files because we just changed directories
    fileList.innerHTML = '';


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

    }// end of for loop


    let tab = active.tab();
    tab.path = folderObj.path;
    tab.innerHTML = pathModule.basename(folderObj.path);

    highlightTabs();
    setFileListListeners();
}


// called by event listener of the li. opens a file or folder
function file_dbl_clicked(e) {
    handleClick(e);

    let selectedFile = nameFromLi(this);
    let newPath = pathModule.join(Tracker.folder().path, selectedFile);

    console.log(selectedFile)
    if (Tracker.folder().children[selectedFile].type == 'directory') {
        Tracker.activePane.cd(newPath);
    } else {
        openFile(newPath);
    }
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

function refreshSelectedFiles() {
    let fileList_ul = active.fileList();

    for (li of fileList_ul.children) {
        li.style.backgroundColor = '';
    }


    for (file of selectedFiles.tentative) {
        //console.log(file.li.style.backgroundColor);
        file.li.style.backgroundColor = 'rgb(35, 219, 220)';
    }
}

function hideContextMenu() {
    document.getElementById('contextMenu').style.display = 'none';
}

function showContextMenu(e) {
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
    for (tab of document.getElementsByClassName('tab')) {
        if (tab.active) {
            tab.style.backgroundColor = 'rgb(0, 182, 58)';
        } else {
            tab.style.backgroundColor = 'rgb(0, 182, 58)';
        }
    }
}

// returns number of tabs in a specific tabBar
function numTabs(tabBar) {
    let numTabs = 0;
    for (tab of tabBar.children) {
        if (tab.className == 'tab') {
            numTabs++;
        }
    }
    return numTabs;
}

// adds another box that the user can browse with
function newFileField() {
    let fields = document.getElementsByClassName('fileFieldParent')[0];
    let newField = fields.children[0].cloneNode(true);
    fields.appendChild(newField);
    let domTraverser = new Active(newField);
    domTraverser.tabBar().children[0].active = true;
    domTraverser.tabBar().children[0].path = active.tab().path;
    updateGuiFiles();
    adjustFileFieldParentCss();
}

function adjustFileFieldParentCss() {
    let fields = document.getElementsByClassName('fileFieldParent')[0];
    // using css grid to evenly space the fileFields
    let gridTemplateColumns = '';
    for (k of fields.children) {
        // 1fr for each child of fileFieldParent
        gridTemplateColumns += ' 1fr';
    }
    // set the css grid value for grid-template-columns
    fields.style.gridTemplateColumns = gridTemplateColumns;

    // activate buttons on new element
    setFileListListeners();
}

function openProgramList(e) {
    let list = document.getElementsByClassName('programList')[0];
    console.log(list);
    let location = document.getElementsByClassName('openWithButton')[0].getBoundingClientRect();

    list.style.left = location.x + 'px';
    list.style.top = location.bottom + 'px';
    list.style.display = 'block';

}


init();
