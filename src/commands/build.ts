import {Command, flags} from '@oclif/command'
import * as path from 'path'
import * as qq from 'qqjs'

import * as Meepfile from '../meepfile'

async function mergeDirs(from: string, to: string) {
  if (!await qq.exists(from)) return
  await qq.mkdirp(to)
  for (let f of await qq.ls(from)) {
    await qq.mv([from, f], to)
  }
  await qq.rm(from)
}

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
    const env = await this.buildEnv(args.envDir)
    if (env.DEBUG) process.env.DEBUG = env.DEBUG
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
      await mergeDirs(path.join(buildDir, '.profile.d'), path.join(args.buildDir, '.profile.d'))
      await mergeDirs(path.join(buildDir, '.heroku'), path.join(args.buildDir, '.heroku'))
      await qq.x(`./${buildpackID}/bin/release`, [buildDir, args.cacheDir, args.envDir])
    }
  }

  private async buildEnv(dir: string): Promise<{[k: string]: string}> {
    const env: {[k: string]: string} = {}
    for (let k of await qq.ls(dir)) {
      env[k] = await qq.read([dir, k])
    }
    return env
  }
}
