

function fileClicked() {

    let selectedFile = removeEdgeSpaces(this.children[1].textContent)
    let newPath = currentFolder.path + '\\' + selectedFile;


    if (currentFolder.children[selectedFile].type == 'directory') {
        currentFolder = new Folder(path.resolve(newPath));
        updateGuiFiles(currentFolder);
    } else {

        openFile(newPath);
    }
}


function setEventListeners() {

    let filelist = document.getElementById('fileList');
    for (let filebar of fileList.children) {

        filebar.addEventListener('dblclick', fileClicked, false);
        filebar.addEventListener('contextmenu', showFileMenu,false);

    }

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



function showFileMenu(e) {
    console.log(e);
}

function fileListHeader_li() {
    let filler = document.createElement('span');

    let fileName = document.createElement('span');
    fileName.appendChild(document.createTextNode('File Name'));
    fileName.style.gridColumn = '1/3';

    let fileSize = document.createElement('span');
    fileSize.appendChild(document.createTextNode('Size'));

    let lastModified = document.createElement('span');
    lastModified.appendChild(document.createTextNode('Last Modified'));

    let toReturn_li = document.createElement('li');
    toReturn_li.appendChild(fileName);
    toReturn_li.appendChild(fileSize);
    toReturn_li.appendChild(lastModified);

    return toReturn_li;
}

init();
