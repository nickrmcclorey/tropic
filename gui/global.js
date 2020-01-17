// ==== global variables ==== \\
// TODO: find better solution then global variables

const args = require('electron').remote.getGlobal('args');
const { ipcRenderer } = require('electron');

let currentFolder = {}
let Tracker = {}
let templates = null
let settings = null
let selectedFiles = {}
let defaultIcons = {}
let settingsInputBox = null