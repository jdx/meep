function termwidth(stream: any): number {
  if (!stream.isTTY) {
    return 80
  }
  const width = stream.getWindowSize()[0]
  if (width < 1) {
    return 80
  }
  if (width < 40) {
    return 40
  }
  return width
}

const columns: number | null = parseInt(process.env.COLUMNS!, 10) || (global as any).columns

export let stdout = columns || termwidth(process.stdout)
export let stderr = columns || termwidth(process.stderr)
