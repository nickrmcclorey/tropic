
function fileClicked() {
    console.log(this.children[1].textContent);
    let newPath = path.normalize(currentFolder.path + '/' + this.children[1].innerHTML);
    console.log(newPath);
    currentFolder = constructFolderObj(path.resolve(newPath));
    document.getElementById('fileList').innerHTML = '';
    updateGuiFiles(currentFolder);
}


function setEventListeners() {

    let filelist = document.getElementById('fileList');
    for (let filebar of fileList.children) {

        filebar.addEventListener('click', fileClicked, false);

    }

}


function updateGuiFiles(folderObj) {

    let fileList = document.getElementById('fileList');

    for (let fileName of Object.keys(folderObj.children)) {
        let file = '<li><img></img><span>' + fileName + '</span></li>';
        fileList.innerHTML += file;
    }


}


init();
