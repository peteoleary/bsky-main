/* eslint-env node */

// Tracer code above must come before anything else
const path = require('node:path')
const assert = require('node:assert')
const cluster = require('cluster')
const { Secp256k1Keypair } = require('@atproto/crypto')
const { ServerConfig, BskyAppView } = require('@atproto/bsky')

const main = async () => {
  const env = getEnv()
  const config = ServerConfig.readEnv()
  assert(env.serviceSigningKey, 'must set BSKY_SERVICE_SIGNING_KEY')
  const signingKey = await Secp256k1Keypair.import(env.serviceSigningKey)
  const bsky = BskyAppView.create({ config, signingKey })
  await bsky.start()
  // Graceful shutdown (see also https://aws.amazon.com/blogs/containers/graceful-shutdowns-with-ecs/)
  const shutdown = async () => {
    await bsky.destroy()
  }
  process.on('SIGTERM', shutdown)
  process.on('disconnect', shutdown) // when clustering
}

const getEnv = () => ({
  serviceSigningKey: process.env.BSKY_SERVICE_SIGNING_KEY || undefined,
})

main().catch((err) => {
  console.error(err)
  process.exit(1)
})