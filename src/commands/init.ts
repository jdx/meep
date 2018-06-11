import {Command, flags} from '@oclif/command'

export default class Init extends Command {
  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    this.parse(Init)
    console.dir('init')
  }
}