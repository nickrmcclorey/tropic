const {exec} = require('child_process');
const os = require('os');
const fs = require('fs');
const pathModule = require('path');

// ==== global variables ==== \\
let currentFolder = {};
const settings = require('./settings.json');
let selectedFiles = new SelectedFiles();
let defaultIcons = new Array();
let active = new Active(document.getElementsByClassName('fileField')[0]);
// ==== end of global variables ====\\


function init() {

    loadDefaultIcons();

    if (Object.keys(settings).includes('homeFolder') ) {
        currentFolder = new Folder(settings.homeFolder);
    } else {
        currentFolder = new Folder(os.homedir());
    }


    for (el of document.getElementsByClassName('tab')) {
        el.active = true;
        el.path = currentFolder.path;
        el.innerHTML = pathModule.basename(currentFolder.path);
    }

    for (inputBox of document.getElementsByClassName('pathBox')) {
        inputBox.value = currentFolder.path;

    }

    setInitListeners();
    currentFolder.read().then(() => {
        for (fileList of document.getElementsByClassName('fileList')) {
            updateGuiFiles(currentFolder, fileList);
        }
        setFileListListeners();
    })
}

function handleClick(e) {

    for (fileField of document.getElementsByClassName('fileField')) {
        if (e.path.includes(fileField) && fileField != active.fileField) {
            console.log('changing panes');
            active = new Active (fileField);
            currentFolder = new Folder(active.inputBox().value);
        }
    }

    let contextMenu = document.getElementById('contextMenu');
    if (!e.path.includes(contextMenu)) {
        hideContextMenu();
    }
}

function openDir(path, fileFieldEl) {
    currentFolder = new Folder(path);
    currentFolder.read()
    .then(() => {updateGuiFiles(currentFolder, fileFieldEl);});
}

function goToParentDirectory(e) {

    handleClick(e);
    let newPath = this.parentNode.children[2].value + '/..';
    openDir(newPath);

}



// opens a file in a seperate program
function openFile(rawPath) {
    if (currentFolder.children[pathModule.basename(rawPath)].type == 'directory') {
        openDir(rawPath);
        hideContextMenu();
        return;
    }

    // some quotes are added to deal with paths with spaces
    if (process.platform == 'win32') {
        let afterC = rawPath.substr(rawPath.indexOf('\\')+1);
        exec('start C:\\"'+afterC + '"');
    } else {
        alert('Support for your operating system isn\'t available yet');
    }
}


// the files in img folder are read into an array
// if the pictures name matches an extension, it is used.
// i.e. putting an picture called xlsx.png in the img folder
// will cause the program to use that picture as the .xlsx icon
function loadDefaultIcons() {
    let refined = new Array();
    let raw = null;


    raw = fs.readdirSync(pathModule.resolve(__dirname,'img'));


    // chopping off extensions
    for (let k of raw) {
        let newEntry = k.substr(0, k.indexOf('.'));
        refined.push(newEntry);
    }
    defaultIcons = defaultIcons.concat(refined);
};

// returns the path to the file that should be used.
// settings.json can be used to set file icons
function fileIconPath(fileObj) {

    if (Object.keys(settings.img).includes(fileObj.type)) {
        return 'img/' + settings.img[fileObj.type];
    }

    if (defaultIcons.includes(fileObj.type)) {
        return 'img/' + fileObj.type + '.png';
    } else {
        return 'img/blank.png';
    }

}



function clearSelectedFiles() {
    let fileList_ul = active.fileList();

    // reset color of files in browser
    for (li of fileList_ul.children) {
        li.style.backgroundColor = '';
    }
    selectedFiles.tentative = new Array();
}

// reloads the page with any file changes
function refresh() {

    for (fileField of document.getElementsByClassName('fileField')) {
        let domTraverser = new Active(fileField);
        let newFolder = new Folder(domTraverser.inputBox().value);
        newFolder.read()
        .then(() => {updateGuiFiles(newFolder, domTraverser.fileList())})
    }


}


// function to make a new folder or file
// makeDir should be boolean that is true if creating folder, false if creating file
function createNewChild(makeDir) {
    console.log(makeDir);
    let fileList = active.fileList();
    let inputEl = newInputBox();
    inputEl.setAttribute('id', 'newFileInput');

    inputEl.addEventListener('keypress', function (e) {
        let keyPressed = e.which;
        if (keyPressed == 13) {
            let userInput = inputEl.value;

            if (makeDir && !fs.existsSync()) {
                fs.mkdirSync(userInput);
            } else {
                fs.writeFile(userInput, '', () => {});
            }

            refresh();
        }
    }, false);

    // if inputEl loses focus, cancel the creation of new file
    inputEl.addEventListener('blur', () => { inputEl.style.display = 'none' }, false);


    fileList.prepend(inputEl);
    inputEl.focus();
}


// there's no recovering deleted files.
//Maybe I could find path to trash but this is different for each OS
// Maybe I could create my own trash folder
function deleteFile() {
    console.log(selectedFileNames());
    for (let fileName of selectedFileNames()) {
        if (currentFolder.children[fileName].isDirectory()) {
            fs.rmdir(fileName, printError);
        } else {
            fs.unlink(fileName, printError);
        }
    }
    refresh();
}

// goes through selectedFiles and grabs just
// the li elements and returns them in an array
function selectedFileNames() {
    let toReturn = new Array();
    for (let obj of selectedFiles.tentative) {
        console.log(obj);
        toReturn.push(obj.li.children[1].textContent);
    }
    return toReturn;
}

// usually results in contextMenu being shown
function fileRightClicked(e) {
    //console.log(e);
    if (!e.ctrlKey && selectedFiles.tentative.length == 1) {
        clearSelectedFiles();
    }
    // 'this' is the li element
    selectFile(this);

    showContextMenu(e);

    console.log(selectedFiles);
}




// creates input box, waits for user to enter new name or click elsewhere
function renameFiles() {
    hideContextMenu();
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

            fs.rename(currentFolder.path + '/' + oldName, currentFolder.path + '/' + newName, (error) => {
                if (error) {
                    console.log(error);
                    alert('failed to rename file')
                }
                refresh();
                clearSelectedFiles();
            }); // end of fs.rename callback
        }// end of if
    }, false); // end of keypress callback

    // if user clicks elsewhere, replace the input box with old name
    inputBox.addEventListener('blur', () => { li.children[1].innerHTML = oldName }, false);


    // showing the input box
    let li = selectedFiles.tentative[0].li;
    li.children[1].innerHTML = '';
    li.children[1].appendChild(inputBox);
    inputBox.focus();

} // end of rename sequence


// these files will be highlighted and held as global variables
// for future use. i.e. copy, paste
function selectFile(li_target) {

    // get li target as e.target could be child element of path

    li_target.style.backgroundColor = 'rgb(35, 219, 220)';

    let path = currentFolder.path + '\\' + nameFromLi(li_target);

    selectedFiles.addTentative(path, li_target);
}


function pasteSelectedFiles() {
    // can't paste if files haven't been copied
    if (!selectedFiles.pendingAction) {
        return;
    }


    for (selectedFile of selectedFiles.locked) {
        let fileName = pathModule.basename(selectedFile.path);

        // cut or copy depending on previous selection
        if (selectedFiles.pendingAction == 'cut') {
            fs.rename(selectedFile.path, pathModule.join(currentFolder.path, fileName), printError ); // end of callback and fs.rename
        } else if (selectedFiles.pendingAction == 'copy') {
            fs.copyFile(selectedFile.path, pathModule.join(currentFolder.path, fileName), printError);
        }
    } // end of for loop



    pendingAction = null;
    //refresh();
}




// called by the tab
function changeTab(e) {

    // if user clicks on the active tab, we do nothing
    if (this.active) {
        return;
    }

    // there can only be one active tab per tab bar.
    // we set all the tabs in the bar to inactive and set the clicked tab to active
    for (tab of this.parentNode.children) {
        tab.active = false;
    }
    this.active = true;
    handleClick(e);
    console.log('passed');


    // update input box with accurate path
    active.inputBox().value = this.path;
    this.active = true;

    currentFolder = new Folder(this.path);
    currentFolder.read()
    .then(() => { updateGuiFiles(currentFolder); });


}



function addTab(e) {
    handleClick(e);

    // deactivate active tab as we are about to switch tabs
    active.tab().active = false;

    // navigate to the tabBar with all the tabs in it
    let tabBar = e.target.parentNode;
    // create new tab
    let newChild = document.createElement('span');
    newChild.setAttribute('class', 'tab');
    newChild.appendChild(document.createTextNode(pathModule.basename(active.inputBox().value)));
    newChild.path = active.inputBox().value;
    newChild.active = true;

    let xButton = document.createElement('span');
    xButton.innerHTML = 'x';
    xButton.addEventListener('click', eraseTab, false);

    // add tab button must stay on the right
    tabBar.insertBefore(newChild, this);
    tabBar.insertBefore(xButton, this);

}


function eraseTab(e) {
    console.log(this.previousSibling);

    let tabToDelete = this.previousSibling;
    if (tabToDelete.active) {
        tabToDelete.parentNode.children[0].active = true;
    }

    while (this.previousSibling.className != 'tab') {
        console.log(this.previousSibling.className);
        this.parentNode.removeChild(this.previousSibling);
    }
    this.parentNode.removeChild(this.previousSibling);

    this.parentNode.removeChild(this);

}
