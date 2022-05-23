
const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, 'secret-folder');

async function getFileType() {
  const files = await fs.promises.readdir(folderPath, { withFileTypes: true });
  for (const file of files) {
    if(file.isFile()) {
      const fileData = path.parse(file.name);
      const stats = await fs.promises.stat(path.join(folderPath, file.name));
      
      console.log(`${fileData.name} - ${fileData.ext.substring(1)} - ${(stats.size / 1024).toFixed(3)}Kb`);
    }
  }
}

getFileType();