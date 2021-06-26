const fs = require("fs")
const path = require('path')
const json_editor = require('@json-editor/json-editor')

import { saveSettingsToFile } from "./iconSettings.js"

function getStartupSettings() {
    let setFile = cleanPath(path.join(appPath(), 'gui/settings.json'));
    if (!fs.existsSync(setFile)) {
        let defaultSet = cleanPath(path.join(appPath(), "gui/defaultSettings.json"));
        console.log(defaultSet);
        fs.copyFileSync(defaultSet, setFile);
        console.log('moved settings file')
    }

    let text = fs.readFileSync(path.join(appPath(), "gui/settings.json"), {encoding: 'utf8'})
    return JSON.parse(text)
}

function cleanPath(p) {
    return p.split('\\').join('\\\\');
}

function appPath() {
    let argument = process.argv.filter(arg => arg.startsWith('--app-path='))[0]
    return argument.slice(11)
}

function openLocationSettings() {
    if (schemaEditor)
        return

    document.getElementById('fileFieldParent').style.display = 'none';
    
    let holder = document.getElementById('locationSettings')
    let schema = {
        "type": "array",
        "format": "table",
        "items": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                },
                "path": {
                    "type": "string"
                }
            }
        }
    }

    schemaEditor = new json_editor.JSONEditor(holder, {
        schema: schema,
        disable_collapse: true,
        disable_array_delete_last_row: true,
        disable_array_delete_all_rows: true,
        form_name_root: "Locations",
        theme: 'bootstrap4'
    });
    schemaEditor.setValue(settings.locations)    
}

export { 
    getStartupSettings,
    appPath,
    cleanPath,
    openLocationSettings
};