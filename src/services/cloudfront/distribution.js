import cloudFront from 'infrastructure/cloudfront'

const createDistributionParams = ({
  options: {
    enabled = true,
    targetOriginId,
    targetOriginDomain,
    reference,
    comment = ''
  }
}) => ({
  DistributionConfig: {
    CallerReference: reference,
    Aliases: {
      Quantity: 0,
      Items: []
    },
    DefaultRootObject: '',
    Origins: {
      Quantity: 1,
      Items: [
        {
          Id: targetOriginId,
          DomainName: targetOriginDomain,
          OriginPath: '',
          CustomHeaders: {
            Quantity: 0,
            Items: []
          },
          CustomOriginConfig: {
            HTTPPort: 80,
            HTTPSPort: 443,
            OriginProtocolPolicy: 'http-only',
            OriginSslProtocols: {
              Quantity: 3,
              Items: [ 'TLSv1', 'TLSv1.1', 'TLSv1.2' ]
            },
            OriginReadTimeout: 30,
            OriginKeepaliveTimeout: 5
          }
        }
      ]
    },
    DefaultCacheBehavior: {
      TargetOriginId: targetOriginId,
      ForwardedValues: {
        QueryString: true,
        Cookies: {
          Forward: 'none'
        },
        Headers: {
          Quantity: 0,
          Items: []
        },
        QueryStringCacheKeys: {
          Quantity: 0,
          Items: []
        }
      },
      TrustedSigners: {
        Enabled: false,
        Quantity: 0,
        Items: []
      },
      ViewerProtocolPolicy: 'allow-all',
      MinTTL: 0,
      AllowedMethods: {
        Quantity: 7,
        Items: [
          'HEAD',
          'DELETE',
          'POST',
          'GET',
          'OPTIONS',
          'PUT',
          'PATCH'
        ],
        CachedMethods: {
          Quantity: 2,
          Items: [ 'HEAD', 'GET' ]
        }
      },
      SmoothStreaming: false,
      DefaultTTL: 86400,
      MaxTTL: 31536000,
      Compress: true,
      LambdaFunctionAssociations: {
        Quantity: 0,
        Items: []
      }
    },
    CacheBehaviors: {
      Quantity: 0,
      Items: []
    },
    CustomErrorResponses: {
      Quantity: 0,
      Items: []
    },
    Comment: comment,
    Logging: {
      Enabled: false,
      IncludeCookies: false,
      Bucket: '',
      Prefix: ''
    },
    Enabled: enabled,
    PriceClass: 'PriceClass_All',
    ViewerCertificate: {
      CloudFrontDefaultCertificate: true,
      MinimumProtocolVersion: 'TLSv1',
      CertificateSource: 'cloudfront'
    },
    Restrictions: {
      GeoRestriction: {
        RestrictionType: 'none',
        Quantity: 0,
        Items: []
      }
    },
    WebACLId: '',
    HttpVersion: 'http2',
    IsIPV6Enabled: true
  }
})


export default {
  async create({ targetOriginId, targetOriginDomain, comment }) {
    const date = new Date()
    const reference = String(date.getTime())
    const params = createDistributionParams({
      options: {
        targetOriginId,
        targetOriginDomain,
        reference,
        comment
      } })
    return await cloudFront.createDistribution(params).promise()
  },
  async get({ identifier }) {
    return await cloudFront.getDistribution({ Id: identifier }).promise()
  },
  async update({ identifier, enabled }) {
    const distributionParams = await cloudFront.getDistributionConfig({ Id: identifier }).promise()
    const { DistributionConfig, ETag } = distributionParams
    const params = {
      DistributionConfig: {
        ...DistributionConfig,
        Enabled: enabled
      },
      Id: identifier,
      IfMatch: ETag
    }
    return await cloudFront.updateDistribution(params).promise()
  },
  async delete({ identifier, Etag }) {
    return await cloudFront.deleteDistribution({ Id: identifier, IfMatch: Etag }).promise()
  }
}
