import { spawn } from 'child_process'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default function convert(name) {
  const command = `ffmpeg -i ${__dirname}/video/${name}.ts -map 0 -c copy ${__dirname}/video/${name}.mp4`.split(' ')
  return new Promise(resolve => {
    const ffmpeg = spawn(command[0], command.slice(1))

    ffmpeg.stdout.on('data', data => console.log(data.toString('utf8')))
    ffmpeg.stderr.on('data', error => console.error(error.toString('utf8')))
    ffmpeg.on('close', resolve)
  })
}

if(process.argv[1].endsWith('convert.js')) convert(process.argv[2])
