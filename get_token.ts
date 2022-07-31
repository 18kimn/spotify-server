export function getToken(code: string, port: string) {
  const data = {
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: 'http://localhost:' + port + '/callback'
  }
  return fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization':
        'Basic ' +
        Buffer.from(
          process.env.CLIENT_ID + ':' + process.env.SECRET
        ).toString('base64')
    },
    body: new URLSearchParams(data)
  })
}

const state = {
  token: '',
  expires_in: 0
}

export async function refresh(token: string) {
  const data = {
    grant_type: 'refresh_token',
    refresh_token: token
  }
  const {access_token, expires_in} = await fetch(
    'https://accounts.spotify.com/api/token',
    {
      method: 'POST',
      headers: {
        'Authorization':
          'Basic ' +
          Buffer.from(
            process.env.CLIENT_ID + ':' + process.env.SECRET
          ).toString('base64')
      },
      body: new URLSearchParams(data)
    }
  ).then((res) => res.json())

  state.token = access_token
  state.expires_in = expires_in

  /** just calls itself over and over, making sure we always have
   * a token that's up-to-date
   * */
  setTimeout(() => refresh(access_token), expires_in * 1000)
}

export const provideToken = () => state.token
export const updateToken = (token: string) => {
  state.token = token
}
