import {Command, flags} from '@oclif/command'
import * as express from 'express'

const morgan = require('morgan')

export default class Serve extends Command {
  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    this.parse(Serve)
    const root = process.cwd()
    const app = express()

    // app.name = 'static'
    app.use(morgan('dev'))
    app.use(express.static(root))

    return new Promise((resolve, reject) => {
      const port = process.env.PORT || 5000
      app.listen(port, () => {
        this.log(`serving static assets from ${root} on port ${port}`)
      })
      .on('close', resolve)
      .on('error', reject)
    })
  }
}
