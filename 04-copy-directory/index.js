const fs = require('fs');
const path = require('path');

const folderOut = path.join(__dirname, 'files');
const folderIn = path.join(__dirname, 'files-copy');

async function copyDir() {
  await fs.promises.rm(folderIn, { recursive: true, force: true });
  await fs.promises.mkdir(folderIn, { recursive: true });

  const filesToCopy = await fs.promises.readdir(folderOut);
  
  for (const file of filesToCopy) {
    const filePathOut = path.join(folderOut, file);
    const filePathIn = path.join(folderIn, file);
    await fs.promises.copyFile(filePathOut, filePathIn);
  }
}

copyDir();