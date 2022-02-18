const fs = require('fs')
const path = require('path')

module.exports = {

  /**
   * 判断是否模板文件
   * @param {string} file 文件名
   */
  isTemplate (file) {
    return true
    // const regexp = /^.*\.tmpl(_\w+)?(\..+)?$/;
    // return regexp.test(file);
  },
  /**
   * 将模板文件名转换为文件名
   * @param {string} tmpl 模板文件名
   */
  tmplToFileName (tmpl) {
    let temp = tmpl.replace(/if_(\w|-)+\./, '');
    if (temp.startsWith('.tmpl')) {
      return temp.replace(/^.tmpl(_\w+)?\./, '');
    } else {
      const file = temp.replace(/.tmpl(_\w+)?/, '');
      return file
    }
  },

  /**
   * 递归读取目录文件，并返回相对路径
   *
   * @param {*} dir 要读取的目录
   * @param {*} files 递归参数，一般不需要传
   * @param {*} relative 递归参数，一般不需要传
   */
  readAllFileRecursivelySync (dir, files, relative = '') {
    if (!fs.statSync(dir).isDirectory()) {
      throw new Error('abs path is not dir!')
    }
    if (!files) {
      files = []
    }

    const ls = fs.readdirSync(dir)

    ls.forEach(f => {
      const fpath = path.join(dir, f)
      const rela = path.join(relative, f)
      if (fs.statSync(fpath).isDirectory()) {
        this.readAllFileRecursivelySync(fpath, files, rela)
      } else {
        files.push(rela)
      }
    })
    return files
  },

  /**
   * 从文件名中提取出模板类型
   * @param {string} file 文件名
   */
  extractTmplType (file) {
    const regexp = /^.*\.tmpl(_\w+)?(\..+)?$/;
    const type = regexp.exec(file)[1];
    if (type) {
      return type.slice(1, type.length + 1);
    }
    return 'default';
  },

  /**
   * 从文件名中提取出条件
   * @param {string} file 文件名
   */
  extractConditions (file) {
    const regexp = /.*if_((\w|-)+).*/;
    const result = regexp.exec(file);
    if (result) {
      const conditions = []
      result[1].split('_').forEach(condition => {
        if (condition) {
          conditions.push(condition)
        }
      });
      return conditions;
    } else {
      return [];
    }
  }
}