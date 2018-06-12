import {Command, flags} from '@oclif/command'

export default class Serve extends Command {
  static hidden = true

  static flags = {
    spa: flags.boolean(),
  }

  async run() {
    this.parse(Serve)
    console.log('whoa bro')
  }
}
