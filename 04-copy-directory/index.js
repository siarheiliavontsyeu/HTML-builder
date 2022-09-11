const { readdir, copyFile, mkdir } = require('node:fs/promises');
const path = require('path');

const FgYellow = '\x1b[33m%s\x1b[0m';
const dirName = 'files';
const copyDirName = dirName + '-copy';

const print = (msg) => {
  console.log(FgYellow, msg);
};

const makeDir = async (name) => {
  const filesCopyDirectoryPath = path.join(__dirname, name);
  const dirCreation = await mkdir(filesCopyDirectoryPath, {
    recursive: true,
  });
  return dirCreation;
};

const getDirFiles = async (dirPath) => {
  const filesArr = [];
  const content = await readdir(dirPath, { withFileTypes: true });
  for (const file of content) {
    if (file.isFile()) {
      const { name } = file;
      filesArr.push(name);
    }
  }
  return filesArr;
};

const copyFiles = async (files, fromDirPath, toDirPath) => {
  for (const file of files) {
    const filePath = path.join(fromDirPath, file);
    const newFilePath = path.join(toDirPath, file);
    await copyFile(filePath, newFilePath);
    print(`The file: ${file} has been copied`);
  }
};

const makeCopyDirectory = async (dirName, copyDirName) => {
  try {
    const filesDirectoryPath = path.resolve(__dirname, dirName);
    let copyDir = await makeDir(copyDirName);

    if (copyDir) {
      print(`Directory: ${copyDirName} was created`);
    } else {
      copyDir = path.resolve(__dirname, copyDirName);
      print(`Directory: ${copyDirName} already exists`);
    }

    const files = await getDirFiles(filesDirectoryPath);
    await copyFiles(files, filesDirectoryPath, copyDir);
  } catch (err) {
    console.error(err.message);
  }
};

makeCopyDirectory(dirName, copyDirName);
