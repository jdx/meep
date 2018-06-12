import {Command, flags} from '@oclif/command'
import * as fs from 'fs-extra'

import {Meepfile} from './dev'

const YML = require('js-yaml')

export default class Serve extends Command {
  static hidden = true

  static args = [
    {name: 'buildDir', required: true},
    {name: 'cacheDir', required: true},
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    const {args} = this.parse(Serve)
    const yml: Meepfile = YML.safeLoad(await fs.readFile('Meepfile.yml', 'utf8'))
    this.debug('yml:')
    this.debug(yml)
    console.dir(yml)
  }
}
