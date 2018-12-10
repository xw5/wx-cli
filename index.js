#! /usr/bin/env node

const commd = require('commander');
const download = require('github-download-parts');
const shelljs = require('shelljs');
const loading = require('ora');
const answer = require('inquirer');
const chalk = require('chalk');

commd.version('v1.0.3','-v,--version');
commd.option('-c,--component','创建一个组件');
commd.option('-d,--dialog','创建一个弹窗组件');
commd.option('-b,--basedialog','创建一个基础弹窗组件');
commd.option('-p,--page','创建一个页面');

let childCmd = commd.command('create <dirname>');
childCmd.description('创建开发目录');
childCmd.action((dirName) => {
  createTemplateBefore(dirName);
});

commd.parse(process.argv);

/**
 * 
 * @param dirName 要生成的目录名
 */
function createTemplateBefore (dirName) {
  if (!shelljs.test('-d',dirName)){
    createTemplate(dirName);
  } else {
    answer.prompt([{
      type: 'list',
      name: 'newOrReplace',
      message: chalk.red(chalk.white.bgRed(dirName),'已存在，请选择处理方式'),
      choices: [{
        value: 'new',
        name: '重新输入目录名'
      },{
        value: 'replace',
        name: '直接替换'
      }],
      default: 0
    }]).then((newOrReplaceAnswer) => {
      let action = newOrReplaceAnswer.newOrReplace;
      if(action === 'new'){
        answer.prompt([{
          type: 'input',
          name: 'rename',
          message: '请重新输入目录名',
          default: dirName,
          validate: function(val) {
            if(val.trim() === ''){
              return '项目名不能为空！';
            }
              return true;
          }
        }]).then((renameAnswer) => {
          createTemplateBefore(renameAnswer.rename);
        })
      }else if(action === 'replace'){
        shelljs.rm('-rf',dirName);
        createTemplate(dirName);
      }
    })
  }
}

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
   let type = 'page';
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
   let loadingEffect = loading(`Loading ${dirName},请稍等...\r\n`).start();
   download('xw5/wx-template',dirName,type).then(() => {
    loadingEffect.stop();
    renameFileName(dirName,type);
    replacePlaceholder('placeholder-str',dirName+'/'+dirName,dirName);
    console.log(chalk.green(chalk.white.bgGreen(dirName),'创建成功!'));

    //如果是生成自定弹窗组件且当前通用弹窗组件没有生成会自动去生成通用的弹窗组件
    if(type === 'dialog_custom' && !shelljs.test('-d','dialog')){
      let loadingEffect = loading(`通用弹窗模板生成中,请稍等...\r\n`).start();
      download('xw5/wx-template','dialog','base_dialog').then(() => {
        loadingEffect.stop();
        console.log(chalk.green(chalk.white.bgGreen('dialog'),'通用弹窗模板创建成功!'));
      })
    }
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
  shelljs.sed('-i',oldStr, replaceStr+'.js',dirName+'/'+dirName+'.js');
  shelljs.sed('-i',oldStr, replaceStr+'.wxss',dirName+'/'+dirName+'.wxss');
  shelljs.sed('-i',oldStr, replaceStr+'.wxml',dirName+'/'+dirName+'.wxml');
}