import cache from 'services/cache'
import retry from 'services/retry'

export default async (payload) => {
  return await retry(8)(cache.head)(payload.target)
}
