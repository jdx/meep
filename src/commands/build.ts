import {Command, flags} from '@oclif/command'
import * as path from 'path'
import * as qq from 'qqjs'

import * as Meepfile from '../meepfile'
import * as Procfile from '../procfile'

const YML = require('js-yaml')

export interface Release {
  default_process_types?: string
}

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
    // const procfile = await Procfile.load(args.buildDir)
    const procfile: Procfile.File = {}
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

      const release: Release = YML.safeLoad(await qq.x.stdout(`./${buildpackID}/bin/release`, [buildDir, args.cacheDir, args.envDir]))
      for (let [type, cmd] of Object.entries(release.default_process_types || {})) {
        procfile[type] = c.command || `cd ${name} && ${cmd}`
      }
      await Procfile.save(args.buildDir, procfile)
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
