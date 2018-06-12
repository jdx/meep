import {Command, flags} from '@oclif/command'
import chalk from 'chalk'
import * as execa from 'execa'
import * as _ from 'lodash'
import * as path from 'path'

import LineTransform from '../line_transform'
import * as Meepfile from '../meepfile'
import * as screen from '../screen'

const wrapAnsi = require('wrap-ansi')
const Debug = require('debug')
const stringWidth = require('string-width')

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
    const yml = await Meepfile.load()
    const components = Object.entries(yml.components)
    maxHeaderLength = _.max(components.map(([name]) => name.length)) || 0
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
    let command = c.command
    if (!command) {
      switch (c.buildpack) {
        case 'node':
          command = 'npm start'
          break
        case 'static':
          if (c.spa) command = 'meep serve --spa'
          else command = 'meep serve'
          break
        default:
          throw new Error(`unexpected type: ${(c as any).type} on ${name}`)
      }
    }
    debug(command)
    const proc = execa.shell(command, {
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
        let lines = wrapAnsi(output, maxWidth - stringWidth(header), {
          hard: true
        }).split('\n').map((s: string) => `${header} ${s}`)
        if (!lines.length) return
        process[stream].write(lines.join('\n') + '\n')
      })
    }
    proc.on('close', code => this.log(`${header} exited with code ${code}`))

    return proc
  }
}
