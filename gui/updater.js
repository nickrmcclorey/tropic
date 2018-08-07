// Nicholas McClorey - 7/30/2018


function setFileListListeners() {

    // button to go to parent directory
    document.getElementById('backButton').addEventListener('click', goToParentDirectory, false);
    // user entered path into path box
    document.getElementById('pathBox').addEventListener('keypress', pathBoxKeyDown, false);
    // hide right click menu whne user clicks elsewhere
    document.addEventListener('click', handleClick, false);

    let filelist = document.getElementById('fileList');
    for (let filebar of fileList.children) {

        // open file on double click
        filebar.addEventListener('dblclick', file_dbl_clicked, false);
        // file selected
        filebar.addEventListener('click', fileClicked, false);
        // file right clicked, open contextMenu
        filebar.addEventListener('contextmenu', fileRightClicked, false);

    }

}

function setInitListeners() {
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
    // document.getElementById('').addEventListener('click',,false);


    document.getElementsByClassName('newDirButton')[0].addEventListener('click', () => {createNewChild(true)})
    document.getElementsByClassName('newFileButton')[0].addEventListener('click', () => {createNewChild(false)}, false);
}

// updates the display with the list of files and their relavant information
function updateGuiFiles(folderObj) {

    let fileList = document.getElementById('fileList');
    document.getElementById('pathBox').value = folderObj.path;
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

    setFileListListeners();
}



// called by event listener of the li. opens a file or folder
function file_dbl_clicked() {
    console.log(this);

    let selectedFile = nameFromLi(this);
    let newPath = pathModule.resolve(currentFolder.path + '/' + selectedFile);


    if (currentFolder.children[selectedFile].type == 'directory') {
        currentFolder = new Folder(newPath);
        updateGuiFiles(currentFolder);
    } else {
        openFile(newPath);
    }
}

// this is a callback of each li element in the file list
function fileClicked(e) {

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
    let fileList_ul = document.getElementById('fileList');

    for (li of fileList_ul.children) {
        li.style.backgroundColor = '';
    }


    for (file of selectedFiles.tentative) {
        console.log(file.li.style.backgroundColor);
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

// navigates the browser to the path typed in the box at top of page
function pathBoxKeyDown(e) {
    console.log(e);
    let keyPressed = e.which || e.keyCode;
    if (keyPressed === 13) { // enter button
        currentFolder = new Folder(this.value);
    }
}




function newInputBox() {
    let inputBox = document.createElement('input');
    inputBox.setAttribute('type', 'text');
    return inputBox;

}


init();
