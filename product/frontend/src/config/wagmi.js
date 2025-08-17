import { createConfig, http } from '@wagmi/core'
import { flowTestnet } from './chains.js'

export const config = createConfig({
  chains: [flowTestnet],
  transports: {
    [flowTestnet.id]: http()
  }
})
