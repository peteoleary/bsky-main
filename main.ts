import * as repo from '@atproto/repo'
import { AtpAgent } from '@atproto/api'
import { TestNetworkNoAppView } from '@atproto/dev-env'
import { HOUR } from '@atproto/common'

let serverHost: string
let agent: AtpAgent

TestNetworkNoAppView.create({
    dbPostgresSchema: 'repo_subscribe_repos',
    pds: {
      repoBackfillLimitMs: HOUR,
    },
  }).then((network) => {
    serverHost = network.pds.url.replace('http://', '');
  let ctx = network.pds.ctx
  agent = network.pds.getClient()
const getRepo = async (did: string): Promise<repo.VerifiedRepo> => {
    const carRes = await agent.api.com.atproto.sync.getRepo({ did })
    const car = await repo.readCarWithRoot(carRes.data)
    const signingKey = await network.pds.ctx.actorStore.keypair(did)
    return repo.verifyRepo(car.blocks, car.root, did, signingKey.did())
  }

  getRepo('did:atp:repo:0x1234').then((repo) => {
    console.log(repo)
  })
})
