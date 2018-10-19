import serializeError from 'serialize-error'

import cloudFront from 'services/cloudfront/distribution'
import da from 'services/da'
import domainService from 'services/domain'

export default async (req, res) => {
  try {
    const { identifier } = req.params

    const { domain, cname } = await da.getInfrastructure(identifier)

    await cloudFront.remove(identifier)
    await domainService.removeRecordSet(cname, domain)

    res.sendStatus(204)
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
