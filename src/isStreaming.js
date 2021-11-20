import { parse } from 'node-html-parser'
import fetch from 'node-fetch'

export default async function isStreaming(channelID){
  const response = await fetch(`https://youtube.com/channel/${channelID}/live`)
  const text = await response.text()
  const html = parse(text)
  const canonicalURLTag = html.querySelector('link[rel=canonical]')
  const canonicalURL = canonicalURLTag.getAttribute('href')
  const isLive = canonicalURL.includes('/watch?v=')
  return isLive && canonicalURL.split('/watch?v=')[1]
}

if(process.argv[1].endsWith('isStreaming.js')) console.log(await isStreaming(process.argv[2]))
