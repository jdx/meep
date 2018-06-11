import {Command, flags} from '@oclif/command'
import chalk from 'chalk'
import * as execa from 'execa'
import * as fs from 'fs-extra'
import * as _ from 'lodash'
import * as path from 'path'

import LineTransform from '../line_transform'
import * as screen from '../screen'

const Toml = require('toml')
const wrapAnsi = require('wrap-ansi')
const Debug = require('debug')
const stringWidth = require('string-width')

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
let port = 5000
let colorIdx = 0
let maxHeaderLength = 0

function getColor(): typeof chalk {
  const color = ['blueBright', 'greenBright'][colorIdx++] as keyof typeof chalk
  if (!color) {
    colorIdx = 0
    return getColor()
  }
  return chalk[color] as any
}

export default class Dev extends Command {
  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    this.parse(Dev)
    const toml: Meepfile = Toml.parse(await fs.readFile('Meepfile.toml', 'utf8'))
    this.debug('toml:')
    this.debug(toml)
    // TODO: find a better way to not require sorting
    const components = Object.entries(toml.component || {})
    maxHeaderLength = _.max(components.map(([name]) => name.length))
    const procs = components.map(([name, c]) => this.start(name, c))
    await Promise.all(procs)
  }

  private async start(name: string, c: Meepfile.Component) {
    const env = {
      PORT: (port++).toString()
    }
    const debug = Debug(`meep:${name}`)
    const root = path.join(process.cwd(), name)
    const header = getColor()(name.padEnd(maxHeaderLength))
    c.type = await this.detect(name, c)
    c.command = c.command || DEFAULT_COMMANDS[c.type]
    debug(c.command)
    const proc = execa.shell(c.command, {
      cwd: root,
      encoding: 'utf8',
      env,
    })

    for (let stream of ['stdout', 'stderr'] as ('stdout' | 'stderr')[]) {
      proc[stream]
      .pipe(new LineTransform())
      .setEncoding('utf8')
      .on('data', output => {
        const maxWidth = screen[stream] || 120
        let lines = wrapAnsi(output, maxWidth - stringWidth(header).length, {
          hard: true
        }).split('\n').map((s: string) => `${header} ${s}`)
        if (!lines.length) return
        process[stream].write(lines.join('\n') + '\n')
      })
    }
    proc.on('close', code => this.log(`${header} exited with code ${code}`))

    return proc
  }

  private async detect(name: string, c: Meepfile.Component): Promise<keyof typeof DEFAULT_COMMANDS> {
    if (c.type) return c.type
    const root = path.join(process.cwd(), name)
    if (await fs.pathExists(path.join(root, 'index.html'))) return 'static'
    throw new Error(`unable to determine type of ${root}`)
  }
}
