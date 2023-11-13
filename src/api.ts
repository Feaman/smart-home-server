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

function httpRequest(params: RequestOptions, data?: { entity_id: string }): Promise<{ entity_id: string, state: string }[]> {
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
    
    if (data) {
      request.write(JSON.stringify(data))
    }

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

        'input_boolean.night_mode',
        'input_boolean.hallway_persist_mode',
        'input_boolean.bathroom_bathing_mode',
        'input_boolean.big_room_night_mode',

        'switch.wall_switch_small_room_light',
        'light.light_small_room_night_light',
        'switch.wall_switch_hall_light',
        'switch.wall_switch_kitchen_light_left',
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

app.post('/toggle/:domain', async (request, response, next) => {
  try {
    const data = await httpRequest(
      { ...baseOptions, path: `/api/services/${request.params.domain}/toggle`, method: 'POST' },
      { entity_id: request.body.entityId }
    )
    return response.status(200).json(data)
  }
  catch (error) {
    return next(error)
  }
})
