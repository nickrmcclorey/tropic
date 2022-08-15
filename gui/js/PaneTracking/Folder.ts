import fs from "fs"
import File from "./File"


class Folder {
    children:{[fileName: string]: File} = {};

    constructor(public path: string) {

        let childrenNames = fs.readdirSync(path);

        for (let fileName of childrenNames) {

            try {
                let fsInfo = fs.statSync(path +'/'+ fileName);
                let file= new File(fsInfo, fileName);
                this.children[fileName] = file
            } catch (e) {
                continue;
            }
        }
    }
}
export default Folder
