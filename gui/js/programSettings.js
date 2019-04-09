function showProgramSettings() {
    hideSettings();
    document.getElementById('fileFieldParent').style.display = 'none';
    $('#programSettings').show();
    
    let list = $('#programSettingTable')[0];
    // clear list except for header
    while (list.children.length > 1) {
        list.removeChild(list.children[1]);
    }

    for (let key of Object.keys(settings.programs)) {
        console.log(key);
        let entry = document.createElement('tr');
        entry.setAttribute('class', 'programEntry')
        entry.innerHTML = '<td><input class="label"/></td><td><input type="checkbox"/></td><td><input type="checkbox"/></td><td><input/></td><td><button class="removeProgram">X</button></td>';
        entry.children[0].children[0].value = key;
        entry.children[1].children[0].checked = settings.programs[key].canOpenFile;
        entry.children[2].children[0].checked = settings.programs[key].canOpenFolder;
        entry.children[3].children[0].value = settings.programs[key].path;
        list.appendChild(entry);
    }

    $('.newProgramEntry').on('click', () => {
        let entry = document.createElement('tr');
        entry.innerHTML = '<td><input class="label"/></td><td><input type="checkbox"/></td><td><input type="checkbox"/></td><td><input/></td><td><button>X</button></td>';
        list.appendChild(entry);
    });

    $('.Apply').on('click', () => {
        let programSettings = {};
        for (let row of $('.programEntry')) {

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
    });

    for (el of $('.removeProgram')) {
        el.addEventListener('click', (e) => {
            let row = e.target.parentNode.parentNode;
            row.parentNode.removeChild(row);
        }, false);
    }
}