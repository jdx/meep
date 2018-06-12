import * as fs from 'fs-extra'
import * as path from 'path'

const YML = require('js-yaml')
const debug = require('debug')('meep')

export interface File {
  components: { [name: string]: Component }
}
export type Component = {
  buildpack: string
  command?: string
  spa?: boolean
}

export async function load(root = process.cwd()): Promise<File> {
  const file = path.join(root, 'Meepfile.yml')
  const yml: File = YML.safeLoad(await fs.readFile(file, 'utf8'))
  yml.components = yml.components || {}
  for (let c of Object.values(yml.components)) {
    switch (c.buildpack) {
      case 'heroku/static-s3':
        c.buildpack = 'https://github.com/jdxcode/heroku-buildpack-static-s3'
        break
      case 'heroku/node':
      case 'heroku/nodejs':
        c.buildpack = 'https://github.com/heroku/heroku-buildpack-nodejs'
    }
  }
  debug('meepfile:')
  debug(yml)
  return yml
}
