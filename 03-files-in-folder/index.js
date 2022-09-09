const { readdir, stat } = require('node:fs/promises');
const path = require('path');

const FgYellow = '\x1b[33m%s\x1b[0m';

const secretDirectoryPath = path.resolve(__dirname, './secret-folder');

const print = (fileName, extName, fileSize) => {
  console.log(FgYellow, `${fileName} - ${extName} - ${fileSize}`);
};

const readDir = async (dirPath) => {
  try {
    const files = await readdir(dirPath, { withFileTypes: true });
    for (const file of files) {
      if (file.isFile()) {
        const { name } = file;
        const fileName = name.split('.')[0];
        const extName = path.extname(name).slice(1);
        const filePath = path.join(secretDirectoryPath, name);
        const getFileStat = await stat(filePath);
        const fileSize = (await getFileStat.size) / 1024 + ' kb';
        print(fileName, extName, fileSize);
      }
    }
  } catch (err) {
    console.error(err.message);
  }
};

readDir(secretDirectoryPath);
