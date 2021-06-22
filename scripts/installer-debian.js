const installer = require('electron-installer-debian')

const options = {
  src: 'builds/tropic-linux-x64/',
  dest: 'installers/',
  arch: 'amd64'
}

async function main (options) {
  console.log('Creating package (this may take a while)')
  try {
    await installer(options)
    console.log(`Successfully created package at ${options.dest}`)
  } catch (err) {
    console.error(err, err.stack)
    process.exit(1)
  }
}
main(options)