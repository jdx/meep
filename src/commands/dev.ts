import {Command, flags} from '@oclif/command'
import * as execa from 'execa'
import * as fs from 'fs-extra'
import * as path from 'path'

const Toml = require('toml')

export interface Meepfile {
  component?: {
    [name: string]: {
      command?: string
    }
  }
}

export default class Dev extends Command {
  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    this.parse(Dev)
    const toml: Meepfile = Toml.parse(await fs.readFile('Meepfile.toml', 'utf8'))
    console.dir(toml)
    for (let [name, component] of Object.entries(toml.component || {})) {
      const cwd = path.join(process.cwd(), name)
      await execa.shell(component.command, {
        cwd,
        stdio: 'inherit',
      })
    }
  }
}
