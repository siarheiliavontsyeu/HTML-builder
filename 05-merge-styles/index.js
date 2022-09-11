const path = require('path');
const { readdir, readFile, writeFile } = require('node:fs/promises');

const stylesDirName = 'styles';
const destinationDirName = 'project-dist';

const stylesExtName = '.css';
const bundleCssName = 'bundle.css';

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

const getCssFiles = (filesArr) => {
  return filesArr.filter((file) => stylesExtName === path.extname(file));
};

const readContent = async (file) => {
  const fileContent = await readFile(file, { encoding: 'utf8' });
  return fileContent;
};

const readFilesContent = async (filesArr, dirPath) => {
  const contentArr = [];
  for (const file of filesArr) {
    const filePath = path.join(dirPath, file);
    const content = await readContent(filePath);
    contentArr.push(content);
  }
  return contentArr;
};

const writeToBundle = async (data, toDirPath) => {
  const bundlePath = path.join(toDirPath, bundleCssName);
  await writeFile(bundlePath, data, { flag: 'w' });
};

const makeBundle = async (dirName, destDirName) => {
  try {
    const filesDirectoryPath = path.resolve(__dirname, dirName);
    const destDirectoryPath = path.resolve(__dirname, destDirName);
    const dirContent = await getDirFiles(filesDirectoryPath);
    const cssFiles = getCssFiles(dirContent);
    const cssFilesContent = await readFilesContent(
      cssFiles,
      filesDirectoryPath
    );
    await writeToBundle(cssFilesContent.join(''), destDirectoryPath);
  } catch (error) {
    console.error(error.message);
  }
};

makeBundle(stylesDirName, destinationDirName);
