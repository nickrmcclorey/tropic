
function fileClicked() {
    let selectedFile = removeEdgeSpaces(this.children[1].textContent)
    let newPath = currentFolder.path + '\\' + selectedFile;
    console.log(newPath);

    if (currentFolder.children[selectedFile].type == 'directory') {
        currentFolder = new Folder(path.resolve(newPath));
        updateGuiFiles(currentFolder);
    } else {
        console.log("'start " + newPath +"'");
        openFile(newPath);
    }
}


function setEventListeners() {

    let filelist = document.getElementById('fileList');
    for (let filebar of fileList.children) {

        filebar.addEventListener('dblclick', fileClicked, false);

    }

}

// updates the display with the list of files and their relavant information
function updateGuiFiles(folderObj) {

    let fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    // folderObj.children is an associative array indexed by strings corresponding to the files' names
    for (let fileName in folderObj.children) {
        // this will be one row in the file list
        let file_li = document.createElement('li');

        let img = document.createElement('img'); // icon of file
        img.setAttribute('src', fileIconPath(folderObj.children[fileName]));
        let spanName = document.createElement('span');

        let date = folderObj.children[fileName].lastModified;
        let spanDate = document.createElement('span');
        spanDate.appendChild(document.createTextNode(date.getMonth() + '/' + date.getDate() + '/' + date.getYear()));
        spanDate.setAttribute('class','fileDate');

        spanName.appendChild(document.createTextNode(fileName));

        file_li.appendChild(img);
        file_li.appendChild(spanName);
        file_li.appendChild(spanDate);
        fileList.appendChild(file_li);

    }// end of for

    setEventListeners();
}

document.getElementById('backButton').addEventListener('click', function() {

    let newPath = currentFolder.path + '\\..'
    console.log(newPath);
    currentFolder = new Folder(path.resolve(newPath));
    document.getElementById('fileList').innerHTML = '';
    updateGuiFiles(currentFolder);
    setEventListeners();
}, false);



init();
