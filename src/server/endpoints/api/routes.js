import bodyParser from 'body-parser'
import express from 'express'

import customHeaders from './controllers/custom-headers'
import invalidCache from './controllers/invalid-cache'

const app = express()

app.use(bodyParser())

app.post('/cache-invalidations', invalidCache)
app.post('/headers-custom', customHeaders)

export default app
