import { spawn } from 'child_process'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default function record(videoID, filename) {
  return new Promise((resolve, reject) => {
    const command = `streamlink --loglevel debug --http-cookie VISITOR_INFO1_LIVE=${process.env.VISITOR_TOKEN} https://youtu.be/${videoID} 720p,480p,best -o ${__dirname}/video/${filename}.ts --hls-live-restart`.split(' ')
    const streamlink = spawn(command[0], command.slice(1))

    streamlink.stdout.on('data', data => {
      if(data.includes('LIVE_STREAM_OFFLINE')) reject('LIVE_STREAM_OFFLINE')
      else console.log(data.toString('utf8'))
    })
    streamlink.stderr.on('data', error => console.error(error.toString('utf8')))
    streamlink.on('close', resolve)
  })
}

if(process.argv[1].endsWith('record.js')) record(process.argv[2], process.argv[3])
