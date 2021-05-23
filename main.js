const http = require('http')
const url = require('url')
const path = require('path')
const fs = require('fs').promises
const { createReadStream } = require('fs')
const mime = require('mime')
const ejs = require('ejs')
const { promisify } = require('util')

function mergeConfig(config) {
  return {
    port: 1234,
    directory: process.cwd(),
    ...config
  }
}

class Server {
  constructor(config) {
    this.config = mergeConfig(config)
  }

  start() {
    const server = http.createServer(this.serveHandle.bind(this))

    server.listen(this.config.port, () => {
      console.log(`server is running on ${this.config.port}...`)
    })
  }

  async serveHandle(req, res) {
    let { pathname } = url.parse(req.url)

    pathname = decodeURIComponent(pathname)

    const absPath = path.join(this.config.directory, pathname)

    try {
      const stateObj = await fs.stat(absPath)

      if (stateObj.isFile()) {
        this.fileHandle(req, res, absPath)
      } else {
        let dirs = await fs.readdir(absPath)

        dirs = dirs.map(item => ({
          path: path.join(pathname, item),
          dirs: item
        }))

        const renderFile = promisify(ejs.renderFile)

        const parentpath = path.dirname(pathname)

        const ret = await renderFile(path.resolve(__dirname, 'template.html'), {
          arr: dirs,
          parent: pathname !== '/',
          parentpath,
          title: path.basename(absPath)
        })

        res.end(ret)
      }
    } catch (err) {
      this.errorHandle(req, res, err)
    }
  }

  errorHandle(req, res, err) {
    console.log(err)

    res.statusCode = 404
    res.setHeader('Content-Type', 'text/html;charset=utf-8')
    res.end('Not Found')
  }

  fileHandle(req, res, absPath) {
    res.statusCode = 200
    res.setHeader('Content-Type', `${mime.getType(absPath)};charset=utf-8`)
    createReadStream(absPath).pipe(res)
  }
}

module.exports = Server