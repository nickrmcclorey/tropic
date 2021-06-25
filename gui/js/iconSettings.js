const path = require("path")
const fs = require('fs')
import { showProgramSettings } from "./programSettings.js"
import { appPath } from "./settingsManager.js"
import SystemI from "./SystemI.ts";

ipcRenderer.on('sayHello', (evt, msg) => console.log(msg));

ipcRenderer.on('executeFunction', (event, functionName) => {
    console.log(functionName)
    const functionMap = {
        "showIconSettings": showSettings,
        "showProgramSettings": showProgramSettings,
        "showAdvancedSettings": showAdvancedSettings,
        "hideSettings": hideSettings
    }
    functionMap[functionName]();
});


function showAdvancedSettings() {
    let pathToSettings = path.join(process.cwd(), 'gui/settings.json');
    SystemI.instance.openFile(pathToSettings)
}

function showSettings() {
    document.getElementById('fileFieldParent').style.display = 'none';
    let settings_el = document.getElementById('settings');

    settings_el.style.display = 'grid';

    let ul = document.createElement("ul")
    ul.setAttribute('id', 'fileExtensions')
    for (let extensionName in settings.fileTypes) {
        let extension = settings.fileTypes[extensionName];

        let newRow = document.createElement('li');
        newRow.innerHTML += '<img src="./img/' + extension.img + '"/>'
        newRow.innerHTML += '<label class="fileType">' + extensionName + '</label>'
        newRow.innerHTML += '<input type="text" class="fileIconName" size="13" value=' + extension.img + '>'
        newRow.innerHTML += '<button class="iconButtons">select</button>'
        newRow.innerHTML += '<button class="removeEntry">X</button>';

        ul.appendChild(newRow);
    }


    // append buttons
    let appendExtensionButton = document.createElement('button')
    appendExtensionButton.innerHTML = 'new file extension'
    appendExtensionButton.addEventListener('click', appendNewFileExtension)

    let applyButton = document.createElement('button')
    applyButton.innerHTML = 'apply'
    applyButton.setAttribute('disabled', true);
    applyButton.id = 'applyButton';
    applyButton.addEventListener('click', saveIconSettings, false);

    let buttonContainer = document.createElement('div')
    buttonContainer.setAttribute('id', 'buttonContainer')
    buttonContainer.appendChild(appendExtensionButton)
    buttonContainer.appendChild(applyButton)

    settings_el.innerHTML = '';
    settings_el.appendChild(ul);
    settings_el.appendChild(buttonContainer)

    setSettingsListeners();
}

function appendNewFileExtension() {
    let extensionInput = document.createElement('input')
    extensionInput.setAttribute('type', 'text')
    extensionInput.setAttribute('size', '3')
    extensionInput.addEventListener('blur', convertToLabel, false)

    let newRow = document.createElement('li');
    newRow.innerHTML += '<input type="text" size="13">'
    newRow.innerHTML += '<button class="iconButtons">select</button>'
    setSettingsListeners();

    newRow.prepend(extensionInput)
    document.getElementById('fileExtensions').appendChild(newRow);
    setSettingsListeners();
}


function convertToLabel(e) {
    let span_el = document.createElement('label')
    span_el.textContent = e.target.value
    span_el.setAttribute('class', 'fileType')

    this.parentNode.insertBefore(span_el, this)
    this.parentNode.removeChild(this)
}


function hideSettings() {
    document.getElementById('fileFieldParent').style.display = 'grid';
    let settings = document.getElementById('settings');
    settings.style.display = 'none';
    document.getElementById('programSettings').style.display = 'none';
}


function selectIcon(e) {
    if (e.target.nodeName != 'IMG' || settingsInputBox == null) {
        hideIconSelector();
        return
    }

    // set value of picture in input box
    settingsInputBox.value = path.basename(e.target.src);
    let picture = settingsInputBox.previousSibling.previousSibling;
    picture.setAttribute('src', e.target.src);
    settingsInputBox = null;

    // hide the icon selecor
    let elToDelete = document.getElementsByClassName('iconSelector')[0]
    elToDelete.parentNode.removeChild(elToDelete);
    document.getElementById('applyButton').removeAttribute('disabled');

}


function hideIconSelector() {
    let iconSelector = document.getElementById('iconSelector')
    iconSelector.parentNode.removeChild(iconSelector)
}


function setSelectedInputBox(e) {
    if (e.target.getAttribute('class') != 'iconButtons' || document.getElementsByClassName('iconSelector').length > 0) {
        return
    }

    settingsInputBox = e.target.previousSibling;
    let settings = document.getElementById('settings')
    settings.appendChild(loadIconSelector())

    for (let el of document.getElementsByClassName('iconSelector')) {
        el.addEventListener('click', selectIcon, false)
    }
}


function loadIconSelector() {
    let iconSelector = document.createElement('div')
    iconSelector.setAttribute('class', 'iconSelector')
    iconSelector.setAttribute('id', 'iconSelector')

    let icons = fs.readdirSync(__dirname + '/img')

    for (let iconName of icons) {
        let img_el = document.createElement('img')
        img_el.setAttribute('src', "img/" + iconName)
        iconSelector.appendChild(img_el);
    }

    return iconSelector;
}


function setSettingsListeners(e) {
    for (let el of document.getElementsByClassName('iconButtons')) {
        el.addEventListener('click', setSelectedInputBox, false)
    }

    for (let el of document.getElementsByClassName('fileIconName')) {
        el.addEventListener('keydown', () => {
            document.getElementById('applyButton').removeAttribute('disabled');
        });
    }

    for (let el of document.getElementsByClassName('removeEntry')) {
        el.addEventListener('click', (e) => {
            let fileType = e.target.parentNode.children[1].textContent;
            console.log(fileType)
            settings.fileTypes[fileType] = undefined;
            e.target.parentNode.remove()
            document.getElementById('applyButton').removeAttribute('disabled');
        }, false);
    }
}


function saveIconSettings() {
    // fileExtension will be the element with the file extension in it
    for (let fileExtension_el of document.getElementsByClassName('fileType')) {
        let fileExtension = fileExtension_el.textContent;
        if (settings.fileTypes[fileExtension] == undefined) {
            settings.fileTypes[fileExtension] = new Object();
        }

        settings['fileTypes'][fileExtension]['img'] = fileExtension_el.nextSibling.value;
    }
    saveSettingsToFile();
    loadDefaultIcons();
}


function saveSettingsToFile() {
    let pathToSettings = path.join(process.cwd(), 'gui/settings.json');
    let outputString = JSON.stringify(settings, null, 4);
    fs.writeFile(pathToSettings, outputString, () => { });
    console.log(pathToSettings)
}


// the files in img folder are read into an array
// if the pictures name matches an extension, it is used.
// i.e. putting an picture called xlsx.png in the img folder
// will cause the program to use that picture as the .xlsx icon
function loadDefaultIcons() {
    let raw = fs.readdirSync(path.join(appPath(), 'gui/img'));

    // chopping off extensions
    for (let fileName of raw) {
        let newEntry = fileName.substr(0, fileName.indexOf('.'));
        defaultIcons[newEntry] = fileName;
    }

    for (let extension of Object.keys(settings.fileTypes)) {
        defaultIcons[extension] = settings.fileTypes[extension].img;
    }
}


export {
    saveSettingsToFile,
    showSettings,
    hideSettings,
    loadDefaultIcons
}