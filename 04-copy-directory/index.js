const fs = require('fs');
const path = require('path');

async function copyDir() {
  const folderOut = path.join(__dirname, 'files');
  const folderIn = path.join(__dirname, 'files-copy');

  await clearTargetDiretory(folderIn);
  await fs.promises.mkdir(folderIn, { recursive: true });
  await copyData(folderOut, folderIn);
}

async function copyData(folderOut, folderIn) {
  try {
    const dataToCopy = await fs.promises.readdir(folderOut, { withFileTypes: true });
    for (const data of dataToCopy) {
      if(data.isDirectory()) {
        const directoryPath = path.join(folderOut, data.name);
        const targetDirectory = path.join(folderIn, data.name);
        await fs.promises.mkdir(targetDirectory, { recursive: true });
        copyData(directoryPath, targetDirectory);
      }
      if(data.isFile()) {
        const filePathOut = path.join(folderOut, data.name);
        const filePathIn = path.join(folderIn, data.name);
        await fs.promises.copyFile(filePathOut, filePathIn);
      }
    }
  } catch (err) {
    console.log(err.message);
  }
}

async function clearTargetDiretory(folderIn) {
  try {
    await fs.promises.rm(folderIn, { recursive: true, force: true });
  } catch (err) {
    console.log(err.message);
  }
}

copyDir(); 