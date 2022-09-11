const path = require('path');
const {
  readdir,
  readFile,
  writeFile,
  mkdir,
  copyFile,
} = require('node:fs/promises');

const FgYellow = '\x1b[33m%s\x1b[0m';
const FgGray = '\x1b[30m%s\x1b[0m';

const reTags = /{{([a-z]*)}}/gim;

const distDirName = 'project-dist';
const componentsDirName = 'components';
const assetsDirName = 'assets';
const stylesDirName = 'styles';
const templateHTML = 'template.html';
const bundleCssFileName = 'style.css';
const bundleHtmlFileName = 'index.html';
const stylesExtName = '.css';
const htmlExtName = '.html';
const delimiter = '*'.repeat(50);

const print = (msg, color) => {
  console.log(color, msg);
};

const makeDir = async (name, dirPath) => {
  const directoryPath = path.join(dirPath, name);
  const dirCreation = await mkdir(directoryPath, {
    recursive: true,
  });
  return dirCreation;
};

const getDirContent = async (dirPath) => {
  const filesArr = [];
  const dirsArr = [];
  const content = await readdir(dirPath, { withFileTypes: true });
  for (const file of content) {
    if (file.isFile()) {
      const { name } = file;
      filesArr.push(name);
    }
    if (file.isDirectory()) {
      const { name } = file;
      dirsArr.push(name);
    }
  }
  return { filesArr, dirsArr };
};

const copyFiles = async (files, fromDirPath, toDirPath) => {
  for (const file of files) {
    const filePath = path.join(fromDirPath, file);
    const newFilePath = path.join(toDirPath, file);
    await copyFile(filePath, newFilePath);
    print(`File: ${file} has been copied`, FgYellow);
  }
};

const getNecessaryFiles = (filesArr, extName) => {
  return filesArr.filter((file) => extName === path.extname(file));
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

const writeToBundle = async (data, toDirPath, fileName) => {
  const bundlePath = path.join(toDirPath, fileName);
  await writeFile(bundlePath, data, { flag: 'w' });
};

const makeDistDir = async (dirName, dirPath) => {
  print(delimiter, FgGray);
  let dir = await makeDir(dirName, dirPath);
  if (dir) {
    print(`Directory: ${dirName} was created`, FgYellow);
  } else {
    dir = path.resolve(dirPath, dirName);
    print(`Directory: ${dirName} already exists`, FgYellow);
  }
  return dir;
};

const makeAssetsCopy = async (assetsDist) => {
  const assetsDirPath = path.resolve(__dirname, assetsDirName);
  const assetsContent = await getDirContent(assetsDirPath);
  await copyFiles(assetsContent.filesArr, assetsDirPath, assetsDist);
  for (const dir of assetsContent.dirsArr) {
    // make dir
    const newDir = await makeDistDir(dir, assetsDist);
    const dirPath = path.join(assetsDirPath, dir);
    const dirContent = await getDirContent(dirPath);
    await copyFiles(dirContent.filesArr, dirPath, newDir);
  }
};

const makeCSSBundle = async (dirName, destDirName) => {
  const filesDirectoryPath = path.resolve(__dirname, dirName);
  const destDirectoryPath = path.resolve(__dirname, destDirName);
  const dirContent = await getDirContent(filesDirectoryPath);
  const cssFiles = getNecessaryFiles(dirContent.filesArr, stylesExtName);
  const cssFilesContent = await readFilesContent(cssFiles, filesDirectoryPath);
  await writeToBundle(
    cssFilesContent.join(''),
    destDirectoryPath,
    bundleCssFileName
  );
  print(delimiter, FgGray);
  print(`Styles bundle: ${bundleCssFileName} was created`, FgYellow);
};

const makeIndexBundle = async (projectDist) => {
  const templateHTMLPath = path.resolve(__dirname, templateHTML);
  let templateHTMLContent = await readContent(templateHTMLPath);
  const templateTags = templateHTMLContent.match(reTags);
  const componentsPath = path.resolve(__dirname, componentsDirName);
  const componentsDirContent = await getDirContent(componentsPath);
  const htmlFiles = getNecessaryFiles(
    componentsDirContent.filesArr,
    htmlExtName
  );
  const componentsTagsContent = {};
  for (const component of htmlFiles) {
    const componentPath = path.join(componentsPath, component);
    const componentContent = await readContent(componentPath);
    componentsTagsContent[component.slice(0, -5)] = componentContent;
  }
  for (const tag of templateTags) {
    templateHTMLContent = templateHTMLContent.replace(
      tag,
      componentsTagsContent[tag.slice(2, -2)]
    );
  }
  await writeToBundle(templateHTMLContent, projectDist, bundleHtmlFileName);
  print(delimiter, FgGray);
  print(`Index bundle: ${bundleHtmlFileName} was created`, FgYellow);
};

const buildPage = async (distDirName, assetsDirName) => {
  try {
    // make project-dist
    const projectDist = await makeDistDir(distDirName, __dirname);
    // make assets
    const assetsDist = await makeDistDir(assetsDirName, projectDist);
    // make assets copy
    await makeAssetsCopy(assetsDist);
    // merge styles
    await makeCSSBundle(stylesDirName, distDirName);
    // work with template.html
    await makeIndexBundle(projectDist);
  } catch (error) {
    console.error(error);
  }
};

buildPage(distDirName, assetsDirName);
