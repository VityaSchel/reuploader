import { spawn } from 'child_process'

export default function getStreams(url, start, end, filename) {
  const youtubedl = spawn('youtube-dl', ['-f', '18', '--get-url', url])
  youtubedl.stdout.on('data', data => {
    cut(data.toString('utf8').split('\n')[0], start, end, filename)
  })
  youtubedl.stderr.on('data', data => console.error(data.toString('utf8')))
}

// function cut([video, audio], start, end, filename) { for 1080p and 480p
//   // console.log('command', 'ffmpeg', ['-ss', start, '-i', video, '-ss', start, '-i', audio, '-map', '0:v', '-map', '1:a', '-ss', '0', '-t', duration, '-c:v', 'libx264', '-c:a', 'aac', filename].join(' '))
//   const cutter = spawn('ffmpeg', [
//     '-ss', start, '-to', end, '-i', video,
//     '-map', '0:v', '-map', '1:a', '-ss', '0', '-to', end, '-c:v', 'libx264', '-c:a', 'aac', '-c', 'copy', filename])
//   cutter.stdout.on('data', data => console.log(data.toString('utf8')))
//   cutter.stderr.on('data', data => console.error(data.toString('utf8')))
// }

function cut(src, start, end, filename) {
  const cutter = spawn('ffmpeg', ['-ss', start, '-to', end, '-i', src, filename, '-y'])
  cutter.stdout.on('data', data => console.log(data.toString('utf8')))
  cutter.stderr.on('data', data => console.error(data.toString('utf8')))
}

if(process.argv[1].endsWith('cut.js')) {
  if(process.argv[2].startsWith('https://'))
    getStreams(...process.argv.slice(2))
  else
    cut(...process.argv.slice(2))
}
