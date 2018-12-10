#! /usr/bin/env node

const commd = require('commander');
const download = require('github-download-parts');
const shelljs = require('shelljs');
const path = require('path');

commd.version('v1.0.0','-v,--version');
commd.option('-c,--component','创建一个组件');
commd.option('-d,--dialog','创建一个弹窗组件');
commd.option('-b,--basedialog','创建一个基础弹窗组件');
commd.option('-p,--page','创建一个页面');

let childCmd = commd.command('create <dir-name>');
childCmd.description('创建开发目录');
childCmd.action((dirName) => {
  createTemplate(dirName);
});

console.log(process.execPath,process.cwd())
commd.parse(process.argv);

// 开始构建所需模板
/**
 * 
 * @param dirName 目录名
 */
function createTemplate (dirName) {
  // 模板类别集合
   const templateType = {
    'page': commd.page,
    'component': commd.component,
    'dialog_custom': commd.dialog,
    'base_dialog': commd.basedialog
   };
   let type = '';
   // 要下载的目录选择
   if(templateType.page){
    type = 'page';
   }else if(templateType.component){
     type = 'component';
   }else if(templateType.dialog_custom){
     type = 'dialog_custom';
   }else if(templateType.base_dialog){
     type = 'base_dialog'
   }
   download('xw5/wx-template',dirName,type).then(() => {
    renameFileName(dirName,type);
    replacePlaceholder('placeholder-str/placeholder-str',dirName+'/'+dirName,dirName);
  }).catch(() => {
    console.log('下载失败，请重试！');
  });
}

// 重命名所有文件
/**
 * 
 * @param dirName 目录名
 * @param type 模板目录
 */
function renameFileName(dirName,type){
  shelljs.mv(dirName+'/'+type+'.js',dirName+'/'+dirName+'.js');
  shelljs.mv(dirName+'/'+type+'.wxss',dirName+'/'+dirName+'.wxss');
  shelljs.mv(dirName+'/'+type+'.wxml',dirName+'/'+dirName+'.wxml');
  shelljs.mv(dirName+'/'+type+'.json',dirName+'/'+dirName+'.json');
}

/**
 * 
 * @param oldStr 被替换的字符串
 * @param replaceStr 替换成的字符串
 * @param dirName 要替换的文件目录及文件名
 */
function replacePlaceholder (oldStr,replaceStr,dirName) {
  shelljs.sed('-i',oldStr, replaceStr,dirName+'/'+dirName+'.js');
  shelljs.sed('-i',oldStr, replaceStr,dirName+'/'+dirName+'.wxss');
  shelljs.sed('-i',oldStr, replaceStr,dirName+'/'+dirName+'.wxml');
}