import {Command, flags} from '@oclif/command'
import * as express from 'express'

const morgan = require('morgan')

export default class Serve extends Command {
  static flags = {
    help: flags.help({char: 'h'}),
    spa: flags.boolean(),
  }

  async run() {
    const {flags: {spa}} = this.parse(Serve)
    const root = process.cwd()
    const app = express()

    // app.name = 'static'
    app.use(morgan('dev'))
    app.use(express.static(root))

    if (spa) {
      app.get('*', (_, res) => {
        res.sendFile('index.html')
      })
    }

    return new Promise((resolve, reject) => {
      const port = process.env.PORT || 5000
      app.listen(port, () => {
        this.log(`serving ${spa ? 'spa ' : ''}static assets from ${root} on port ${port}`)
      })
      .on('close', resolve)
      .on('error', reject)
    })
  }
}
