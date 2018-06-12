import * as fs from 'fs-extra'
import * as path from 'path'

export type File = {[type: string]: string}

export async function load(root: string): Promise<File> {
  const file = path.join(root, 'Procfile')
  if (!await fs.pathExists(file)) return {}
  const body = await fs.readFile(file, 'utf8')
  return body.split('\n').reduce((file, line) => {
    const idx = line.indexOf(':')
    file[line.substr(0, idx)] = line.substr(idx + 1).trimLeft()
    return file
  }, {} as File)
}

export async function save(root: string, procfile: File) {
  const file = path.join(root, 'Procfile')
  if (Object.entries(procfile).length === 0) return
  const body = Object.entries(procfile).map(([type, cmd]) => `${type}: ${cmd}`).join('\n')
  await fs.writeFile(file, body)
}
