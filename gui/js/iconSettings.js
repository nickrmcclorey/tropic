
ipcRenderer.on('sayHello', (evt, msg) => console.log(msg));

ipcRenderer.on('executeFunction', (event, functionName) => {
    console.log(functionName);
    window[functionName]();
});


function showSettings() {
    document.getElementById('fileFieldParent').style.display = 'none';
    let settings_el = document.getElementById('settings');

    settings_el.style.display = 'grid';

    let ul = document.createElement("ul")
    ul.setAttribute('id', 'fileExtensions')
    for (extensionName in settings.fileTypes) {
        extension = settings.fileTypes[extensionName];

        let newRow = document.createElement('li');
        newRow.innerHTML += '<label class="fileType">' + extensionName + '</label>'
        newRow.innerHTML += '<input type="text" class="fileIconName" size="13" value='+extension.img+'>'
        newRow.innerHTML += '<button class="iconButtons">select</button>'

        ul.appendChild(newRow);
    }

    // append buttons
    let appendExtensionButton = document.createElement('button')
    appendExtensionButton.innerHTML = 'new file extension'
    appendExtensionButton.addEventListener('click', appendNewFileExtension)

    let applyButton = document.createElement('button')
    applyButton.innerHTML = 'apply'
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
    document.getElementById('fileExtensions').appendChild(newRow)
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
}


function selectIcon(e) {
    console.log(e.target);
    if (e.target.nodeName != 'IMG' || settingsInputBox == null) {
        hideIconSelector();
        return
    }

    // set value of picture in input box
    settingsInputBox.value = pathModule.basename(e.target.src)
    settingsInputBox = null;

    // hide the icon selecor
    let elToDelete = document.getElementsByClassName('iconSelector')[0]
    elToDelete.parentNode.removeChild(elToDelete)

}


function hideIconSelector() {
    let iconSelector = document.getElementById('iconSelector')
    iconSelector.parentNode.removeChild(iconSelector)
}


function setSelectedInputBox(e) {
    if (e.target.getAttribute('class') != 'iconButtons' || $('.iconSelector').length > 0) {
        return
    }

    settingsInputBox = e.target.previousSibling;
    let settings = document.getElementById('settings')
    settings.appendChild(loadIconSelector())

    $('.iconSelector').on('click', selectIcon)
}


function loadIconSelector() {
    let iconSelector = document.createElement('div')
    iconSelector.setAttribute('class', 'iconSelector')
    iconSelector.setAttribute('id', 'iconSelector')

    let icons = fs.readdirSync(__dirname + '\\img')

    for (iconName of icons) {
        let img_el = document.createElement('img')
        img_el.setAttribute('src', "img\\" + iconName)
        iconSelector.appendChild(img_el);
    }

    return iconSelector;
}


function setSettingsListeners() {
    let settings = document.getElementById('fileExtensions')
        settings.addEventListener('click', handlSettingsClick, false)
}


function setSettingsListeners() {
    $('.iconButtons').on('click', setSelectedInputBox)
    $
}


function saveIconSettings() {
    // fileExtension will be the element with the file extension in it
    for( let fileExtension_el of $('.fileType')) {
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
    let pathToSettings = pathModule.join(__dirname, 'settings.json');
    let outputString = JSON.stringify(settings, null, 4);
    fs.writeFile(pathToSettings, outputString, () => {});
}