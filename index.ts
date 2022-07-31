import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import {randomUUID} from 'crypto'
import {
  getToken,
  provideToken,
  refresh,
  updateToken
} from './get_token'
import open from 'open'

const PORT = '7000' || process.env.PORT

function main() {
  const app = express()

  app.use(cors())

  app.get('/', async (_, res) => {
    const state = randomUUID()
    const scope = 'user-read-recently-played'
    const query = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.CLIENT_ID,
      scope: scope,
      redirect_uri: 'http://localhost:' + PORT + '/callback',
      state: state
    })

    res.redirect(
      'https://accounts.spotify.com/authorize?' + query.toString()
    )
  })

  app.get('/callback', async (req, res) => {
    const code = req.query.code as string
    const {access_token, expires_in, refresh_token} = await getToken(
      code,
      PORT
    ).then((res) => res.json())
    res.send(access_token)

    updateToken(access_token)
    setTimeout(() => refresh(refresh_token), expires_in * 1000)
  })

  app.get('/token', async (_, res) => {
    const token = provideToken()
    if (token === '') {
      open('http://localhost:' + PORT + '/')
    }
    res.send(provideToken())
  })

  app.listen(PORT, () => {
    console.log('App listening on ', PORT)
  })
}

main()
