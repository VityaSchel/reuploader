import { checksInterval, defaultInterval } from '../config.js'

function calculateTraffic(checksInterval, defaultInterval) {
  const offset = (new Date().getTimezoneOffset()/-60)-3

  const getIntervalSeconds = (secondsFromStartOfDay) => {
    const today = new Date()
    const h = (h, m) => (Number(h)+offset)*3600 + m*60

    return checksInterval.find(match => {
      const [hoursFrom, minutesFrom] = match.from.split(':')
      const secondsStart = h(hoursFrom, minutesFrom)

      const [hoursTo, minutesTo] = match.to.split(':')
      const secondsEnd = h(hoursTo, minutesTo)

      if(secondsFromStartOfDay >= secondsStart && secondsFromStartOfDay < secondsEnd) return true
    })?.intervals ?? defaultInterval
  }

  const dayLength = 60*60*24
  let secondsFromStartOfDay = 0
  let requests = 0
  while(secondsFromStartOfDay < dayLength){
    secondsFromStartOfDay += getIntervalSeconds(checksInterval, secondsFromStartOfDay)
    requests++
  }
  return requests*57*1024
}

console.log(calculateTraffic(checksInterval, defaultInterval))
