import { saveSettingsToFile, hideSettings } from "./iconSettings.js"
import { isNullOrWhitespace } from "./pure.ts"

function showProgramSettings() {
    hideSettings();
    document.getElementById('fileFieldParent').style.display = 'none';
    document.getElementById('programSettings').style.display = 'block';
    
    let pList = document.getElementById('programSettingTable');
    // clear list except for header
    while (pList.children.length > 1) {
        pList.removeChild(pList.children[1]);
    }

    for (let key of Object.keys(settings.programs)) {
        let entry = document.createElement('tr');
        entry.setAttribute('class', 'programEntry')
        entry.innerHTML = '<td><input class="label"/></td><td><input type="checkbox"/></td><td><input type="checkbox"/></td><td><input/></td><td><button class="removeProgram">X</button></td>';
        entry.children[0].children[0].value = key;
        entry.children[1].children[0].checked = settings.programs[key].canOpenFile;
        entry.children[2].children[0].checked = settings.programs[key].canOpenFolder;
        entry.children[3].children[0].value = settings.programs[key].path;
        pList.appendChild(entry);
    }

    for (let el of document.getElementsByClassName('newProgramEntry')) {
        el.addEventListener('click', () => {
            let entry = document.createElement('tr');
            entry.setAttribute('class', 'programEntry')
            entry.innerHTML = '<td><input class="label"/></td><td><input type="checkbox"/></td><td><input type="checkbox"/></td><td><input/></td><td><button>X</button></td>';
            pList.appendChild(entry);
        },false);
    }

    document.getElementsByClassName('Apply')[0].addEventListener('click', () => {
        let programSettings = {};
        for (let row of document.getElementsByClassName('programEntry')) {

            let programInfo = {};
            programInfo.canOpenFile = row.children[1].children[0].checked;
            programInfo.canOpenFolder = row.children[2].children[0].checked;
            programInfo.path = row.children[3].children[0].value;

            let label = row.children[0].children[0].value;
            if (!isNullOrWhitespace(label) && !isNullOrWhitespace(programInfo.path)) {
                programSettings[label] = programInfo;
            }
        }

        settings.programs = programSettings;
        saveSettingsToFile();
    }, false);

    for (el of document.getElementsByClassName('removeProgram')) {
        el.addEventListener('click', (e) => {
            let row = e.target.parentNode.parentNode;
            row.parentNode.removeChild(row);
        }, false);
    }
}


export {
    showProgramSettings
}