import fs from "fs"

class DirectoryEntry {
	public readonly isDirectory: boolean;
	public readonly lastModified: Date;
	public readonly size: string;
	public readonly type: string;
	public info: fs.Stats;

	constructor (info: fs.Stats) {
		this.isDirectory = info.isDirectory();
		this.lastModified = info.mtime;
	}
}

export default DirectoryEntry
