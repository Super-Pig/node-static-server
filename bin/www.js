#! /usr/bin/env node

const { program } = require('commander')

// 配置信息
let options = {
  '-p --port <dir>': {
    'description': 'init server port',
    'example': 'node-static-server -p 3306'
  },
  '-d --directory <dir>': {
    'description': 'init server directory',
    'example': 'node-static-server -d /Users/penggan/Working'
  }
}

function formatConfig(configs, cb) {
  Object.entries(configs).forEach(([key, val]) => {
    cb(key, val)
  })
}

formatConfig(options, (cmd, val) => {
  program.option(cmd, val.description)
})

program.on('--help', () => {
  console.log('Examples: ')
  formatConfig(options, (cmd, val) => {
    console.log(val.example)
  })
})

const { version } = require('../package')

program.version(version)

const cmdConfig = program.parse(process.argv)

const Server = require('../main')

new Server(cmdConfig.opts()).start()