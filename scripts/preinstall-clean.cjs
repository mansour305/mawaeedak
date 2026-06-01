const fs = require("node:fs");

for (const file of ["package-lock.json", "yarn.lock"]) {
  try {
    fs.rmSync(file, { force: true });
  } catch (error) {
    console.warn(`Unable to remove ${file}: ${error.message}`);
  }
}
