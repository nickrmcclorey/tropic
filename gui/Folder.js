
function Folder(path) {
    path = pathModule.resolve(path);

    let newFolder = {};
    this.children = new Array();
    this.path = path

    process.chdir(path);


    // childrenNames is an array of strings corresponding to files and directories
    // we create an associative array where the filename is the index of it's correpsonding info

    if (process.platform == 'win32') {
        this.parseWinDir();
    } else {
        this.collectFolderContents();
    }


}

Folder.prototype.collectFolderContents = function () {


    for (let fileName of childrenNames) {

        let file = {};
        file.size = null;

        let fsInfo = fs.statSync(path +'/'+ fileName);

        // converts raw size of bytes to string in terms of KB, MB or GB
        if (fsInfo.isDirectory()) {
            file.size = 'folder';
        } else {
            file.size = sizeOf(fsInfo.size);
        }

        file.lastModified = fsInfo.mtime;

        file.type = (fsInfo.isDirectory()) ? 'directory' : findFileExtension(fileName);

        file.isDirectory = function () {
            return this.type == 'directory';
        }

        // we create an associative array where the filename is the index of it's correpsonding info
        this.children[fileName] = file;
    }
}



/* the readdir function doesn't always work on windows so
    so I've called the dir command and parsed the output. */

Folder.prototype.parseWinDir = function () {
    // calling the dir command and recieving its input in parameter 'raw'
    exec('dir "' + this.path + '" ', (error, raw) => {
        // catch error calling dir and invalid path
        if (error) {
            console.log(error);
            return;
        } else if (raw.indexOf('File Not Found') != -1) {
            console.log('path is invalid');
            return;
        }


        // getting rid of '.' and '..' entry
        if (this.path != 'C:\\') {
            // parsing the declared dir to make sure path is correct
            let dirShown = raw.substr(raw.indexOf('Directory of '));
            dirShown = dirShown.substr(dirShown.indexOf('C:'), dirShown.indexOf('\n'));
            dirShown = dirShown.substr(0, dirShown.indexOf('\n'));



            raw = raw.substr(raw.indexOf('<DIR>'));
            raw = raw.substr(raw.indexOf('..'));
            raw = raw.substr(raw.indexOf('\n')+1);
        }

        // removing more lines we don't need
        let list = raw.split('\n');
        for (let k = 0; k < list.length; k++) {
            let currentLine = list[k];

            // each line containing information on a file or dir starts with a date and
            // each date starts with the month witch starts with a 0 or 1 i.e. '02/23/2018'
            if (currentLine.length == 0 || (currentLine[0] != '1' && currentLine[0] != '0')) {
                list.splice(k, 1);
                k--; // list is now one elemente shorter
            } else {
                list[k] = currentLine.substr(0, currentLine.indexOf('\r'));

            }

        }

        // list is now an array of strings
        // each string has the information on one file
        for (let line of list) {
            let newFile = {
                size: null,
                type: null,
                lastModified: null
             };

            // using javascript's built in date parser
            newFile.lastModified = new Date(line.substr(0,21));

            // cut off the date
            line = line.substr(21);
            // break the line up
            line = line.split(' ');



            // === finding size of file === \\

            // ignore the whitespace and find the size of file
            // <DIR> will be there if file is directory
            for (let i in line) {
                if (line[i]) {
                    // console.log(line[i]);
                    newFile.size = line[i];

                    if (line[i] == '<DIR>')  {
                        newFile.size = 'folder';

                    } else {
                        // take the size, remove the commas, convert to a number and convert it to GB, MB or KB
                        newFile.size = sizeOf(Number(newFile.size.replace(/,/g, '')));

                    }

                    //  cut off everything up to this point
                    line.splice(1, i);
                    break;

                }
            }


            // === finding name === \\

            // ignoring whitespace until we reach file name
            for (let i in line) {
                if (line[i]) {
                    // cut off the whitespace before, leaving us the name of the file
                    line.splice(0, i);
                    name = line.join(' ');

                }
            }


            // parsing the file extension, if file
            if (newFile.size != 'folder') {
                newFile.type = findFileExtension(name);
            } else {
                newFile.type = 'directory';
            }



            newFile.isDirectory = function () {
                return this.type == 'directory';
            }

            // we create an associative array where the filename is the index of it's correpsonding info
            this.children[name] = newFile;
        }

        //console.log(this);
        updateGuiFiles(this);

    });

}
