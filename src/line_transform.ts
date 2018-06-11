import {Transform} from 'stream'

export default class LineTransform extends Transform {
  _lastLineData?: string

  _transform(chunk: Buffer, _: string, next: () => void) {
    let data = chunk.toString('utf8')
    if (this._lastLineData) data = this._lastLineData + data

    let lines = data.split('\n')
    this._lastLineData = lines.splice(lines.length - 1, 1)[0]

    lines.forEach(this.push.bind(this))
    next()
  }

  _flush(done: () => void) {
    if (this._lastLineData) this.push(this._lastLineData)
    delete this._lastLineData
    done()
  }
}
