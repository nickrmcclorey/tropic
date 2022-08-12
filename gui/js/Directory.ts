import fs from "fs"

// forces all members of the object to be Fs.Stats objects
interface FsInfoDictionary {
	[name: string]: fs.Stats;
}
