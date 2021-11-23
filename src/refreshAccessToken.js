import './dotenvConfig.js'
import fs from 'fs/promises'
import fetch from 'node-fetch'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default async function refreshAccessToken() {
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: await fs.readFile(`${__dirname}/secrets/refreshToken`)
  })
  const responseRaw = await fetch('https://oauth2.googleapis.com/token?'+params, { method: 'POST' })
  if(responseRaw.status !== 200) throw await responseRaw.text()
  const response = await responseRaw.json()
  const newAccessToken = response.access_token
  await fs.writeFile(`${__dirname}/secrets/accessToken`, newAccessToken)
  return newAccessToken
}

if(process.argv[1].endsWith('refreshAccessToken.js')) console.log(await refreshAccessToken())
