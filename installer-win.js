const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
  .then(createWindowsInstaller)
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })

function getInstallerConfig () {

  return Promise.resolve({
    appDirectory: 'builds/tropic-win32-x64',
    authors: 'Nicholas McClorey',
    noMsi: true,
    outputDirectory: 'installers/windows',
    exe: 'tropic.exe',
    setupExe: 'tropic_install.exe',
    setupIcon: 'gui/img/palm_trees.ico'
  })
}