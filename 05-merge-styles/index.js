const fs = require('fs');
const path = require('path');

const stylesPath = path.join(__dirname, 'styles');
const projectPath = path.join(__dirname, 'project-dist', 'bundle.css');
const ws = fs.createWriteStream(projectPath);

async function bundleFiles() {
  try {
    const cssFiles = await fs.promises.readdir(stylesPath, { withFileTypes: true });
    for(const file of cssFiles) {
      if(file.isFile() && path.extname(file.name) === '.css') {
        const filePath = path.join(stylesPath, file.name);
        const readStream = fs.createReadStream(filePath, 'utf-8');

        let stylesArray = [];
        readStream.on('data', chunk => stylesArray.push(chunk));
        readStream.on('end', () => ws.write(stylesArray.join('') + '\n'));
        readStream.on('error', err => console.log(err.message));
      }
    }
  } catch (err) {
    console.log(err.message);
  }
}

bundleFiles();