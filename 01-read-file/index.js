const fs = require('fs');
const path = require('path');

const fileName = 'text.txt';
const inputFilePath = path.resolve(__dirname, fileName);

const readFile = (filePath) => {
  const readableStream = fs.createReadStream(filePath, 'utf8');

  readableStream
    .on('error', (error) => {
      console.error('error: ', error.message);
    })
    .on('data', (chunk) => {
      console.log(chunk);
    });
};

readFile(inputFilePath);
