import { Address, BigInt } from '@graphprotocol/graph-ts'

// Initialize a Token Definition with the attributes
export class TokenDefinition {
  address: Address
  symbol: string
  name: string
  decimals: BigInt

  // Get all tokens with a static defintion
  static getStaticDefinitions(): Array<TokenDefinition> {
    const staticDefinitions: Array<TokenDefinition> = [
      {
        address: Address.fromString('0x413F1a8F0A2Bd9b6D31B2CA91c4aa7bC08266731'),
        symbol: 'GAMR',
        name: 'GAMR',
        decimals: BigInt.fromI32(18),
      },
      {
        address: Address.fromString('0x63F551298862f306B689724519D95eDA3dCDE5b8'),
        symbol: 'USDC',
        name: 'USDC',
        decimals: BigInt.fromI32(6),
      },
      {
        address: Address.fromString('0xc9700BA01E13eD71E3909a72fe1C0C00B7918ad5'),
        symbol: 'BNB',
        name: 'BNB',
        decimals: BigInt.fromI32(18),
      },
      {
        address: Address.fromString('0x17563c474A5c3FfD51808FDcdDe3457b6dc38932'),
        symbol: 'COQ',
        name: 'COQ',
        decimals: BigInt.fromI32(18),
      },
      {
        address: Address.fromString('0xAAAaBe49A72EcF0804292CE8e889016d9D05767c'),
        symbol: 'WPLYR',
        name: 'WPLYR',
        decimals: BigInt.fromI32(18),
      },
      {
        address: Address.fromString('0x1D1c9Bc4EB65fF52402275a6e64A2773eBF3ed04'),
        symbol: 'AVAX',
        name: 'AVAX',
        decimals: BigInt.fromI32(18),
      },
    ]
    return staticDefinitions
  }

  // Helper for hardcoded tokens
  static fromAddress(tokenAddress: Address): TokenDefinition | null {
    const staticDefinitions = this.getStaticDefinitions()
    const tokenAddressHex = tokenAddress.toHexString()

    // Search the definition using the address
    for (let i = 0; i < staticDefinitions.length; i++) {
      const staticDefinition = staticDefinitions[i]
      if (staticDefinition.address.toHexString() == tokenAddressHex) {
        return staticDefinition
      }
    }

    // If not found, return null
    return null
  }
}
