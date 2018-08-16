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


    for (let filebar of document.getElementsByClassName('fileEntry')) {

        // open file on double click
        filebar.addEventListener('dblclick', file_dbl_clicked, false);
        // file selected
        filebar.addEventListener('click', fileClicked, false);
        // file right clicked, open contextMenu
        filebar.addEventListener('contextmenu', fileRightClicked, false);

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
    // paste button
    for (el of document.getElementsByClassName('pasteButton')) {
        el.addEventListener('click', pasteSelectedFiles, false);
    }
    for (el of document.getElementsByClassName('openButton')) {
        el.addEventListener('click', () => {openFile(selectedFiles.tentative[0].path)},false);
    }


    for (el of document.getElementsByClassName('addTabButton')) {
        el.addEventListener('click', addTab, false);
    }




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
        img.setAttribute('src', fileIconPath(folderObj.children[fileName]));

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

    setFileListListeners();
}



// called by event listener of the li. opens a file or folder
function file_dbl_clicked(e) {
    handleClick(e);
    console.log(currentFolder);

    let selectedFile = nameFromLi(this);
    let newPath = pathModule.resolve(currentFolder.path + '/' + selectedFile);

    console.log(selectedFile)
    if (currentFolder.children[selectedFile].type == 'directory') {
        currentFolder = new Folder(newPath);
        currentFolder.read()
        .then(() => {updateGuiFiles(currentFolder)});
        console.log('updating');
        // updateGuiFiles(currentFolder);
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
    //console.log(e);
    let keyPressed = e.which || e.keyCode;
    if (keyPressed === 13) { // enter button
        handleClick(e);
        currentFolder = new Folder(this.value);
        currentFolder.read()
        .then(() => {updateGuiFiles(currentFolder)})
    }
}



// used when creating new file or folder
function newInputBox() {
    let inputBox = document.createElement('input');
    inputBox.setAttribute('type', 'text');
    return inputBox;

}

init();
