import {Command, flags} from '@oclif/command'

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
    console.dir(args)
  }
}
