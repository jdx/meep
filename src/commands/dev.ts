import {Command, flags} from '@oclif/command'
import * as execa from 'execa'
import * as fs from 'fs-extra'
import * as path from 'path'

import LineTransform from '../line_transform'
import * as screen from '../screen'

const Toml = require('toml')
const wrapAnsi = require('wrap-ansi')

export interface Meepfile {
  component?: { [name: string]: Meepfile.Component }
}
export namespace Meepfile {
  export interface Component {
    type: 'static' | 'node'
    command: string
  }
}

const DEFAULT_COMMANDS = {
  node: 'npm start',
  static: 'meep serve',
}

export default class Dev extends Command {
  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    this.parse(Dev)
    const toml: Meepfile = Toml.parse(await fs.readFile('Meepfile.toml', 'utf8'))
    console.dir(toml)
    const procs = Object.entries(toml.component || {})
    .map(([name, c]) => this.start(name, c))
    await Promise.all(procs)
  }

  private async start(name: string, c: Meepfile.Component) {
    const root = path.join(process.cwd(), name)
    c.type = await this.detect(name, c)
    c.command = c.command || DEFAULT_COMMANDS[c.type]
    const proc = execa.shell(c.command, {cwd: root, encoding: 'utf8'})

    for (let stream of ['stdout', 'stderr'] as ('stdout' | 'stderr')[]) {
      proc[stream]
      .pipe(new LineTransform())
      .setEncoding('utf8')
      .on('data', output => {
        let header = `${name}: `
        const maxWidth = screen[stream] || 120
        let lines = wrapAnsi(output, maxWidth - header.length, {
          hard: true
        }).split('\n').map((s: string) => [header, s].join(''))
        if (!lines.length) return
        process[stream].write(lines.join('\n') + '\n')
      })
    }

    return proc
  }

  private async detect(name: string, c: Meepfile.Component): Promise<keyof typeof DEFAULT_COMMANDS> {
    if (c.type) return c.type
    const root = path.join(process.cwd(), name)
    if (await fs.pathExists(path.join(root, 'index.html'))) return 'static'
    throw new Error(`unable to determine type of ${root}`)
  }
}
