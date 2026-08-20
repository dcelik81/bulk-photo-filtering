import fs from "fs";
import path from "path";

function cleanDir(dirName) {
    const dirPath = path.resolve(dirName);
    if (fs.existsSync(dirPath)) {
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
            fs.rmSync(path.join(dirPath, item), { recursive: true, force: true });
        }
    } else {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

cleanDir("import");
cleanDir("export");
