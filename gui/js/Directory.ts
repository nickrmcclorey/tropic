import fs from "fs"
import DirectoryEntry from "DirectoryEntry"

class Directory {
	public readonly path: string;
	public info: Promise<fs.Stats>;
	public contents: FsInfoDictionary;

}

// forces all members of the object to be Fs.Stats objects
interface FsInfoDictionary {
	[name: string]: fs.Stats;
}
