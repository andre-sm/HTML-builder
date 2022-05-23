const fs = require('fs');
const path = require('path');
const rl = require('readline');
const { stdin: input, stdout: output } = require('process');

const filePath = path.join(__dirname, 'text.txt');
const ws = fs.createWriteStream(filePath);
const readLine = rl.createInterface({ input, output });

output.write('Please, write a message...\n');

const closeProcess = () => {
  output.write('\nBye!');
  readLine.close();
  process.exit();
};

readLine.on('line', line => {
  const currentLine = line.toString().trim();
  if(currentLine === 'exit') {
    closeProcess();
  } else {
    ws.write(`${currentLine}\n`);
  }
});

readLine.on('SIGINT', () => closeProcess());