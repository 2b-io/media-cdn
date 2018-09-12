import cloudFront from 'infrastructure/cloudfront'

export default {
  async create({ targetOriginId, domainName }) {
    const date = new Date()
    const reference = String(date.getTime())
    const params = {
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
              DomainName: domainName,
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
        Comment: '',
        Logging: {
          Enabled: false,
          IncludeCookies: false,
          Bucket: '',
          Prefix: ''
        },
        PriceClass: 'PriceClass_All',
        Enabled: true,
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
    }
    return await cloudFront.createDistribution(params).promise()
  },
  async get({ id }) {
    return await cloudFront.getDistribution({Id: id}).promise()
  },
  async delete({ id }) {
    return await cloudFront.deleteDistribution({Id: id, IfMatch: 'E3MF493D2D0T8S'}).promise()
  }
}
