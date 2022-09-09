const process = require('process');
const readline = require('node:readline');
const fs = require('fs');
const path = require('path');
const { stdin: input, stdout: output } = require('node:process');

const EXIT_COMMAND = 'exit';
const colors = {
  FgMagenta: '\x1b[35m%s\x1b[0m',
  FgCyan: '\x1b[36m%s\x1b[0m',
  FgYellow: '\x1b[33m%s\x1b[0m',
};

const outputFileName = 'output.txt';
const outputFilePath = path.resolve(__dirname, outputFileName);

const print = (color, msg) => {
  console.log(color, msg);
};

const isExit = (input) => input.toLocaleLowerCase() === EXIT_COMMAND;

const exit = (rl) => {
  rl.close();
};

const receiveMsg = (rl, input) => {
  print(colors.FgMagenta, `[ Received: ${input} ]`);
  if (isExit(input)) {
    exit(rl);
  }
};

const writeMsg = (writeStream, input) => {
  writeStream.write(`${input}\n`);
};

const writeFile = () => {
  const writableStream = fs.createWriteStream(outputFilePath, { flags: 'a' });
  const rl = readline.createInterface({ input, output });

  print(colors.FgCyan, '[ Hello! You can type anything: ]');

  rl.on('error', (error) => {
    console.error('error: ', error.message);
  }).on('line', (input) => {
    receiveMsg(rl, input);
    writeMsg(writableStream, input);
  });

  process.on('exit', () => {
    print(colors.FgYellow, '\n[ Goodbye! ]\n');
  });
};

writeFile();
