import {Command, flags} from '@oclif/command'
import * as path from 'path'
import * as qq from 'qqjs'

import * as Meepfile from '../meepfile'

export default class Build extends Command {
  static hidden = true

  static args = [
    {name: 'buildDir', required: true},
    {name: 'cacheDir', required: true},
    {name: 'envDir', required: true},
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    const {args} = this.parse(Build)
    const yml = await Meepfile.load(args.buildDir)
    let idx = 0
    for (let [name, c] of Object.entries(yml.components)) {
      const buildDir = path.join(args.buildDir, name)
      idx++
      const buildpackID = `${idx}-${path.basename(c.buildpack)}`
      await qq.rm(buildpackID)
      await qq.x(`git clone ${c.buildpack} ${buildpackID}`)
      const detect = await qq.x.stdout(`./${buildpackID}/bin/detect`, [buildDir, args.cacheDir, args.envDir])
      if (!detect) throw new Error('detect returned nothing')
      await qq.x(`./${buildpackID}/bin/compile`, [buildDir, args.cacheDir, args.envDir])
    }
  }
}
