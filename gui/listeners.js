
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
        newRow.innerHTML += '<label>' + extensionName + '</label>'
        newRow.innerHTML += '<input type="text" value='+extension.img+'>'
        newRow.innerHTML += '<button class="iconButtons">select</button>'

        ul.appendChild(newRow);
    }

    settings_el.innerHTML = '';
    settings_el.appendChild(ul);

}



function hideSettings() {
    document.getElementById('fileFieldParent').style.display = 'grid';
    let settings = document.getElementById('settings');
    settings.style.display = 'none';
}



function selectIcon(e) {
    console.log(e.target);
    if (e.target.nodeName != 'IMG' || settingsInputBox == null) {
        return null;
    }

    // set value of picture in input box
    settingsInputBox.value = pathModule.basename(e.target.src)
    settingsInputBox = null;

    // hide the icon selecor
    let elToDelete = document.getElementsByClassName('iconSelector')[1]
    elToDelete.parentNode.removeChild(elToDelete)

}



function setSelectedInputBox(e) {
    console.log(e.target);
    settingsInputBox = e.target.previousSibling;
    document.getElementById('settings').appendChild(loadIconSelector())
}



function loadIconSelector() {
    let iconSelector = document.getElementsByClassName('iconSelector')[0].cloneNode(true)
    let icons = fs.readdirSync(__dirname + '\\img')

    for (iconName of icons) {
        let img_el = document.createElement('img')
        img_el.setAttribute('src', "img\\" + iconName)
        iconSelector.appendChild(img_el);
    }

    iconSelector.addEventListener('click', selectIcon, false);

    return iconSelector;
}



showSettings();
document.getElementsByClassName('iconSelector')[0].addEventListener('click', selectIcon, false);
for (el of document.getElementsByClassName('iconButtons')) {
    el.addEventListener('click', setSelectedInputBox, false)
}
