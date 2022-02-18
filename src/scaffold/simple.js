// import fu from '../utils/file.js'
// import fs from 'fs'
// import path from 'path'
// import { template, templateSettings } from 'underscore'
// import inquirer from 'inquirer'

const futils = require('../utils/file.js')
const fs = require('fs')
const path = require('path')
const { template, templateSettings } = require('underscore')
const chalk = require('chalk')

templateSettings.interpolate = /\{\{(.+?)\}\}/g

function gen(folder, ctx) {
  let tmplDir = path.join(__dirname, '../../templates/simple')

  console.log(chalk.blue.bold('🍺 creating simple plugin...'))
  futils.readAllFileRecursivelySync(tmplDir).forEach(file => {
  let f = path.join(tmplDir, file)
    if (futils.isTemplate(f)) {
        let res = template('' + fs.readFileSync(f))(ctx)

        let targetFilePath = path.join(
            folder,
            template(file)(ctx)
        )

        let targetDir = path.dirname(targetFilePath)
        if(!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, {
              recursive: true
          })
        }
        console.log(`${chalk.green.bold('+')} ${chalk.gray(targetFilePath)}`)
        fs.writeFileSync(targetFilePath, res, {
          flag: 'w+'
        })
    }
  })
  console.log(chalk.green.bold('🎉 finished.'))
}

// export default 
module.exports =
{
    generate(folder, ctx) {
      gen(folder, ctx)
    }

}