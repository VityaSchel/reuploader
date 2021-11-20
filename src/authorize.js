import readline from 'readline'
import fetch from 'node-fetch'
import fs from 'fs/promises'

const rl = readline.createInterface(process.stdin, process.stdout)

let params = new URLSearchParams({
  client_id: process.env.YOUTUBE_CLIENT_ID,
  redirect_uri: 'https://example.com',
  response_type: 'code',
  access_type: 'offline',
  scope: 'https://www.googleapis.com/auth/youtube.upload',
})
const authURL = 'https://accounts.google.com/o/oauth2/v2/auth?'+params
console.log('Авторизируйтесь по адресу')
console.log('')
console.log(authURL)
console.log('')

rl.setPrompt('code=')
rl.prompt()
let code = await new Promise(resolve => rl.on('line', resolve))
rl.close()

code = decodeURIComponent(code)

params = new URLSearchParams({
  client_id: process.env.YOUTUBE_CLIENT_ID,
  client_secret: process.env.YOUTUBE_CLIENT_SECRET,
  code,
  grant_type: 'authorization_code',
  redirect_uri: 'https://example.com'
})
const responseRaw = await fetch('https://oauth2.googleapis.com/token?'+params, { method: 'POST' })
const response = await responseRaw.json()

const accessToken = response.access_token
const refreshToken = response.refresh_token
fs.writeFile('accessToken', accessToken)
fs.writeFile('refreshToken', refreshToken)

console.log(response)
console.log(accessToken)
console.log(refreshToken)
