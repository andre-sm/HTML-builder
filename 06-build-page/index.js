const fs = require('fs');
const path = require('path');

const projectPath = path.join(__dirname, 'project-dist');
const conponentsPath = path.join(__dirname, 'components');
const stylesPath = path.join(__dirname, 'styles');
const assetsPath = path.join(__dirname, 'assets');
const assetsTargetPath = path.join(projectPath, 'assets');
const templatePath = path.join(__dirname, 'template.html');
let templateHtml = '';

async function buildPage() {
  await fs.promises.mkdir(projectPath, { recursive: true });
  await fs.promises.mkdir(assetsTargetPath, { recursive: true });
  bundleCss();
  copyAssets(assetsPath, assetsTargetPath);

  const readStream = fs.createReadStream(templatePath, 'utf-8');
  readStream.on('data', chunk => templateHtml += chunk);
  readStream.on('end', async () => { 
    const templateNames = templateHtml.match(/{{.+}}/gi);
    for (const templateName of templateNames) {
      const name = templateName.replace(/{|}/g, '');
      const componentFile = path.join(conponentsPath, `${name}.html`);
      try {
        const data = await getComponentsData(componentFile);
        templateHtml = replaceComponent(templateName, data);
      } catch {
        console.log(`Error: no such '${name}.html' file`);
      }
    }
    await createProject(templateHtml);
  });
  readStream.on('error', () => console.log('Error: template.html does not exist'));
}

async function getComponentsData(component) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(component, 'utf-8');
    let data = [];
    readStream.on('data', chunk => data.push(chunk));
    readStream.on('end', () => resolve(data.join('')));
    readStream.on('error', () => reject(new Error('Error: no such component')));
  });
}

function replaceComponent(title, data) {
  const regex = new RegExp(title, 'g');
  return templateHtml.replace(regex, data);
}

async function createProject(html) {
  const projectHtmlPath = path.join(projectPath, 'index.html');
  const stream = fs.createWriteStream(projectHtmlPath);
  stream.write(html);
}

async function bundleCss() {
  const projectStylesPath = path.join(projectPath, 'style.css');
  const ws = fs.createWriteStream(projectStylesPath);

  const allFiles = await fs.promises.readdir(stylesPath, { withFileTypes: true });

  for(const file of allFiles) {
    if(file.isFile() && path.extname(file.name) === '.css') {
      const filePath = path.join(stylesPath, file.name);
      const readStream = fs.createReadStream(filePath, 'utf-8');

      let stylesArray = [];
      readStream.on('data', chunk => stylesArray.push(chunk));
      readStream.on('end', () => {
        ws.write(stylesArray.join('') + '\n');
      });
      readStream.on('error', err => console.log(err.message));
    }
  }
}

async function copyAssets(assetsPath, assetsTargetPath) {
  const assetsData = await fs.promises.readdir(assetsPath, { withFileTypes: true });
  
  await clearTargetDiretory(assetsTargetPath);

  for (const data of assetsData) {
    if(data.isDirectory()) {
      const directoryPath = path.join(assetsPath, data.name);
      const targetDirectory = path.join(assetsTargetPath, data.name);
      await fs.promises.mkdir(targetDirectory, { recursive: true });
      copyAssets(directoryPath, targetDirectory);
    }
    if(data.isFile()) {
      const filePathOut = path.join(assetsPath, data.name);
      const filePathIn = path.join(assetsTargetPath, data.name);
      await fs.promises.copyFile(filePathOut, filePathIn);
    }
  }
}

async function clearTargetDiretory(assetsTargetPath) {
  const assetsTargetData = await fs.promises.readdir(assetsTargetPath, { withFileTypes: true });
  
  for (const data of assetsTargetData) {
    const targetDirectory = path.join(assetsTargetPath, data.name);
    await fs.promises.rm(targetDirectory, { recursive: true, force: true });
  }
}

buildPage();