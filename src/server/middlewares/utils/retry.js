import delay from 'delay'

export default (retryTimes = 1, interval = 1000) => {
  return (func) => async (...args) => {
    let result;
    let executeTimes = 0;
    let executeError = false

    do {
      executeTimes++

      console.log(`Executing ${ func.name } ${ executeTimes } times...`)

      try {
        result = await func(...args)

        executeError = false
      } catch (error) {
        executeError = error

        if (executeTimes < retryTimes) {
          console.log(`Retry in ${ interval }ms...`)

          await delay(interval)
        }
      }
    } while (!!executeError && executeTimes < retryTimes)

    if (executeError) {
      throw executeError
    }

    return result
  }
}
