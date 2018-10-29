import delay from 'delay'

export default (retryTimes = 1, baseInterval = 100, exponentialBackoff = true) => (func) => async (...args) => {
  let result
  let executeTimes = 0
  let executeError = false

  do {
    executeTimes++

    if (executeTimes > 1) {
      console.log(`Executing ${ func.name } ${ executeTimes } times...`)
    }

    try {
      result = await func(...args)

      executeError = false
    } catch (error) {
      executeError = error

      if (executeTimes < retryTimes) {
        const interval = exponentialBackoff ?
          baseInterval * Math.pow(2, executeTimes - 1) :
          baseInterval

        console.error(`Retry ${ func.name } in ${ interval }ms...`)

        await delay(interval)
      }
    }
  } while (!!executeError && executeTimes < retryTimes)

  if (executeError) {
    throw executeError
  }

  return result
}
