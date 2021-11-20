import 'dotenv/config'
import fetch from 'node-fetch'
import isStreaming from './src/isStreaming.js'
import record from './src/record.js'
import convert from './src/convert.js'
import { checksInterval, defaultInterval, youtubeApiEnabled } from './config.js'

const channelID = process.env.CHANNEL_ID
const offset = (new Date().getTimezoneOffset()/-60)-3

const getIntervalSeconds = () => {
  const today = new Date()
  const secondsFromStartOfDay = (Date.now() - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 1000
  const h = (h, m) => (Number(h)+offset)*3600 + m*60

  return checksInterval.find(match => {
    const [hoursFrom, minutesFrom] = match.from.split(':')
    const secondsStart = h(hoursFrom, minutesFrom)

    const [hoursTo, minutesTo] = match.to.split(':')
    const secondsEnd = h(hoursTo, minutesTo)

    if(secondsFromStartOfDay >= secondsStart && secondsFromStartOfDay < secondsEnd) return true
  })?.intervals ?? defaultInterval
}

async function checkIfStreaming() {
  const channelIsLive = await isStreaming(channelID)
  if(channelIsLive) {
    const filename = Date.now()
    try {
      await record(channelIsLive, filename)
    } catch(e) {
      if(e === 'LIVE_STREAM_OFFLINE') {
        return planDelayedExecution()
      } else throw e
    }
    await convert(filename)
    if(youtubeApiEnabled === true) {
      await upload(filename)
    } else if(youtubeApiEnabled === false) {
      const params = new URLSearchParams({
        chat_id: process.env.TELEGRAM_NOTIFICATION_CHAT_ID,
        text: `Запись завершена, необходимо вручную залить её на ютуб. Название файла: ${filename}.mp4`
      })
      fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_NOTIFICATION_BOT_TOKEN}/sendMessage?${params}`)
    }
    planDelayedExecution()
  } else {
    planDelayedExecution()
  }
}

const planDelayedExecution = () => {
  setTimeout(() => {
    checkIfStreaming()
  }, getIntervalSeconds()*1000)
}

checkIfStreaming()
