// every function in this file is pure
// it doesn't rely on, nor does it affect, any global variables

// parses file extension from full file name (i.e. 'myBook.xlsx' as a parameter returns 'xlsx')
function findFileExtension(fileName) {
    if (fileName.lastIndexOf('.') == -1) {
        return null;
    } else {
        return fileName.substr(fileName.lastIndexOf('.')+1);
    }
}


// grabbing file name from li element
function nameFromLi(li) {
    return li.children[1].textContent.trim();
}

function sizeOf(size) {

        if (size > 1000000000) { // bigger than a gig
            size /= 1000000000;
            return size.toFixed(2).toString() + ' GB';

        } else if (size > 1000000) { // bigger than a meg
            size /= 1000000;
            return size.toPrecision(3).toString() + ' MB';

        } else if (size > 1000) {
            size /= 1000;
            return Math.round(size).toString() + ' KB';

        } else {
            return size.toString() + " Bytes"
        }

}

function printError(error) {
    if (error) {
        console.log(error);
    }
}
