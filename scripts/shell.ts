/**
 *  SHELL
 * 
 *  The child process which is spawn by the server and allows for two-way communication with the client,
 *  which allows us to both run commands and send output to the client.
 * 
 */


console.log('[shell/child] starting...')

if (!process || !process.send) {
  throw new Error('[shell/child] process.send is not available')
}

process.send({ type: 'ready' })

process.on('message', (message) => {
  console.log('[shell/child] received message:', message)
})