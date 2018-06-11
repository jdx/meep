import {Command, flags} from '@oclif/command'

export default class Serve extends Command {
  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    this.parse(Serve)
    const root = process.cwd()
    this.log(`serving from ${root}`)
  }
}
