import fetch from 'node-fetch'
import fs from 'fs/promises'
import refreshAccessToken from './refreshAccessToken.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default async function upload(filename, isCli) {
  const today = new Date()

  await refreshAccessToken()
  const accessToken = await fs.readFile('accessToken')
  const getUploadURLendpoint = 'https://www.googleapis.com/upload/youtube/v3/videos?part=contentDetails&uploadType=resumable'
  const uploadEndpointResponseRaw = await fetch(getUploadURLendpoint,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`,
      body: JSON.stringify({
        {
          snippet: {
            title: `Стрим GoStudy от ${today.getDate()}.${today.getMonth()}.${today.getFullYear()} с ответами на вопросы`,
            description = 'Запись сделана и загружена в YouTube автоматически. Оригинальная трансляция, скорее всего, удалена. Фидбэк: gostudystreams@gmail.com'
          },
          status: {
            privacyStatus: 'public'
          }
        }
      })
    }
  })

  const uploadURL = uploadEndpointResponseRaw.headers.get('Location')
  isCli && console.log(uploadURL)
  isCli && console.log(await uploadEndpointResponseRaw.text())

  const video = await fs.readFile(`${__dirname}/video/${filename}.mp4`)
  const responseRaw = await fetch(uploadURL, { method: 'PUT', body: video })
  const response = await responseRaw.json()
  return response
}

if(process.argv[1].endsWith('upload.js')) console.log(await upload(process.argv[2], true))
