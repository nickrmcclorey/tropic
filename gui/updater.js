



function updateGuiFiles() {
    let fileList = document.getElementById('fileList');



    for (let k = 0; k < currentFolder.files.length; k++) {
        let file = '<li>' + currentFolder.files[k] + '</li>';
        fileList.innerHTML += file;
    }

}
updateGuiFiles();
