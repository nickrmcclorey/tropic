// Nicholas McClorey - 7/30/2018


function setEventListeners() {

    // button to go to parent directory
    document.getElementById('backButton').addEventListener('click', goToParentDirectory, false);
    // user entered path into path box
    document.getElementById('pathBox').addEventListener('keypress', pathBoxClicked, false);
    // hide right click menu whne user clicks elsewhere
    document.addEventListener('click', handleClick, false);

    let filelist = document.getElementById('fileList');
    for (let filebar of fileList.children) {

        filebar.addEventListener('dblclick', file_dbl_clicked, false);
        filebar.addEventListener('click', fileClicked, false);
        filebar.addEventListener('contextmenu', showContextMenu,false);

    }

}

function setContextMenuListeners() {
     document.getElementById('renameButton').addEventListener('click', renameFiles, false);
     document.getElementById('deleteButton').addEventListener('click', deleteFile,false);
    // document.getElementById('').addEventListener('click',,false);
    // document.getElementById('').addEventListener('click',,false);
    // document.getElementById('').addEventListener('click',,false);
    // document.getElementById('').addEventListener('click',,false);

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
            // appending a textNode containing the size of the file
            spanFileSize.appendChild(document.createTextNode(folderObj.children[fileName].size));
        }

        // last modified date
        let date = folderObj.children[fileName].lastModified;
        let spanDate = document.createElement('span');
        spanDate.appendChild(document.createTextNode(date.getMonth() + '/' + date.getDate() + '/' + date.getYear()));
        spanDate.setAttribute('class','fileDate');



        // appending all the elements to the <li> bar
        file_li.appendChild(img);
        file_li.appendChild(spanName);
        file_li.appendChild(spanFileSize);
        file_li.appendChild(spanDate);
        // append <li> to the list
        fileList.appendChild(file_li);

    }// end of for loop

    setEventListeners();
}

function selectFile(e) {

    // get li target as e.target could be child element of path
    let li_target = e.path[e.path.length-7];
    li_target.style.backgroundColor = 'rgb(35, 219, 220)';

    let path = currentFolder.path + '\\' + li_target.children[1].textContent;

    if (!selectedFiles.includes(path)) {
        selectedFiles.push(li_target);
    }
}

// called by event listener of the li showing file info
function file_dbl_clicked() {

    let selectedFile = removeEdgeSpaces(this.children[1].textContent);
    let newPath = currentFolder.path + '/' + selectedFile;


    if (currentFolder.children[selectedFile].type == 'directory') {
        currentFolder = new Folder(path.resolve(newPath));
        updateGuiFiles(currentFolder);
    } else {

        openFile(newPath);
    }
}

function fileClicked(e) {
    let selectedFile = removeEdgeSpaces(this.children[1].textContent);

    if (!e.ctrlKey) {
        clearSelectedFiles();
    }

    selectFile(e);

}


function renameFiles() {
    document.getElementById('contextMenu').style.display = 'none';
    let oldName = selectedFileNames()[0];

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

            fs.rename(oldName, newName, (error) => {
                if (error) {
                    console.log('error');
                } else {
                    refresh();
                    clearSelectedFiles();
                }
            }); // end of fs.rename callback
        }// end of if
    }, false); // end of keypress callback

    // if user clicks elsewhere, replace the input box with old name
    inputBox.addEventListener('blur', () => { li.children[1].innerHTML = oldName }, false);


    // showing the input box
    let li = selectedFiles[0];
    li.children[1].innerHTML = '';
    li.children[1].appendChild(inputBox);
    inputBox.focus();

} // end of rename sequence



function deleteFile() {
    for (let fileName of selectedFileNames()) {
        if (currentFolder.children[fileName].isDirectory()) {
            fs.rmdirSync(fileName);
        } else {
            fs.unlinkSync(fileName);
        }
    }
    refresh();
}

function selectedFileNames() {
    let toReturn = new Array();
    for (let li of selectedFiles) {
        toReturn.push(li.children[1].textContent);
    }
    return toReturn;
}

function showContextMenu(e) {
    //console.log(e);
    if (!e.ctrlKey) {
        clearSelectedFiles();
        selectFile(e);
    }

    let contextMenu = document.getElementById('contextMenu');

    contextMenu.style.left = e.pageX + 'px';
    contextMenu.style.top = e.pageY - 15 + 'px';
    contextMenu.style.display = 'block';

    console.log(selectedFiles);
}

// used to hide contextMenu
function handleClick(e) {
    //console.log(e);

    let contextMenu = document.getElementById('contextMenu');
    if (!e.path.includes(contextMenu)) {
        contextMenu.style.display = 'none';
    } else {
        return;
    }



}

// navigates the browser to the path typed in the box
function pathBoxClicked(e) {
    console.log(e);
    let keyPressed = e.which || e.keyCode;
    if (keyPressed === 13) { // enter button
        currentFolder = new Folder(this.value);
    }
}




init();
