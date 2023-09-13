import cors from 'cors'
import express, { NextFunction, Request, Response } from 'express'
import http from 'http'
import { RequestOptions } from 'https'
import { homeAssistantApiToken } from './secrets'

const PORT = 3018

const baseOptions = {
  hostname: 'elven-home-smarthome.ru',
  protocol: 'http:',
  port: '80',
  path: '',
  method: 'GET',
  headers: { Authorization: `Bearer ${homeAssistantApiToken}` },
}

const app = express()
app.use(express.json()) // for parsing application/json
app.use(cors())

const server = http.createServer(app)
server.listen(PORT, async function () {
  console.log(`Application server started on port ${PORT}`)
})

function httpRequest(params: RequestOptions): Promise<{ entity_id: string, state: string }[]> {
  return new Promise(function (resolve, reject) {
    const request = http.request(params, function (response) {
      if (Number(response.statusCode) < 200 || Number(response.statusCode) >= 300) {
        return reject(new Error('statusCode=' + response.statusCode))
      }

      const body: Uint8Array[] = []
      response.on('data', function (chunk) {
        body.push(chunk)
      })

      response.on('end', function () {
        try {
          resolve(JSON.parse(Buffer.concat(body).toString()))
        } catch (error) {
          reject(error)
        }
      })
    })

    request.on('error', function (err) {
      reject(err)
    })

    request.end()
  })
}

app.get(
  '/states',
  async (_request: Request, response: Response, next: NextFunction) => {
    try {
      const data = await httpRequest({ ...baseOptions, path: '/api/states' })
      const allowedEntities = [
        'sensor.temperature_street',
        'sensor.temperature_balcony',
        'sensor.temperature_small_room',
        'sensor.temperature_big_room',
        'sensor.temperature_hall',
        'sensor.humidity_street',
        'sensor.humidity_balcony',
        'sensor.humidity_small_room',
        'sensor.humidity_big_room',
        'sensor.humidity_hall',
      ]
      const result = data
        .filter( entity => allowedEntities.includes(entity.entity_id))
        .map(entity => ({ id: entity.entity_id, state: entity.state }))

      return response.status(200).json(result)
    } catch (error) {
      return next(error as Error)
    }
  },
)
