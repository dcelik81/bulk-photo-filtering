import fs from "fs";
import path from "path";

const exportDir = path.resolve("export");

if (fs.existsSync(exportDir)) {
    const items = fs.readdirSync(exportDir);
    for (const item of items) {
        fs.rmSync(path.join(exportDir, item), { recursive: true, force: true });
    }
} else {
    fs.mkdirSync(exportDir, { recursive: true });
}
