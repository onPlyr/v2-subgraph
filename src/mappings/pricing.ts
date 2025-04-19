/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts/index'

import { Bundle, Pair, Token } from '../types/schema'
import { ADDRESS_ZERO, factoryContract, ONE_BD, UNTRACKED_PAIRS, ZERO_BD } from './helpers'

const WETH_ADDRESS = '0xaaaabe49a72ecf0804292ce8e889016d9d05767c'
const USDC_WETH_PAIR = '0x37dc84c655d76a485c24f27cf4049b7a6cf39ba1' // created 10008355
const DAI_WETH_PAIR = '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11' // created block 10042267
const USDT_WETH_PAIR = '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852' // created block 10093341

export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
  let daiPair = Pair.load(DAI_WETH_PAIR) // dai is token0
  let usdcPair = Pair.load(USDC_WETH_PAIR) // usdc is token0
  let usdtPair = Pair.load(USDT_WETH_PAIR) // usdt is token1

  // all 3 have been created
  if (daiPair !== null && usdcPair !== null && usdtPair !== null) {
    let totalLiquidityETH = daiPair.reserve1.plus(usdcPair.reserve1).plus(usdtPair.reserve0)
    let daiWeight = daiPair.reserve1.div(totalLiquidityETH)
    let usdcWeight = usdcPair.reserve1.div(totalLiquidityETH)
    let usdtWeight = usdtPair.reserve0.div(totalLiquidityETH)
    return daiPair.token0Price
      .times(daiWeight)
      .plus(usdcPair.token0Price.times(usdcWeight))
      .plus(usdtPair.token1Price.times(usdtWeight))
    // dai and USDC have been created
  } else if (daiPair !== null && usdcPair !== null) {
    let totalLiquidityETH = daiPair.reserve1.plus(usdcPair.reserve1)
    let daiWeight = daiPair.reserve1.div(totalLiquidityETH)
    let usdcWeight = usdcPair.reserve1.div(totalLiquidityETH)
    return daiPair.token0Price.times(daiWeight).plus(usdcPair.token0Price.times(usdcWeight))
    // USDC is the only pair so far
  } else if (usdcPair !== null) {
    return usdcPair.token0Price
  } else {
    return ZERO_BD
  }
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
  '0xaaaabe49a72ecf0804292ce8e889016d9d05767c', // WPLYR
  '0x17563c474a5c3ffd51808fdcdde3457b6dc38932', // COQ
  '0x1d1c9bc4eb65ff52402275a6e64a2773ebf3ed04', // WAVAX
  '0x63f551298862f306b689724519d95eda3dcde5b8', // USDC
  '0x413f1a8f0a2bd9b6d31b2ca91c4aa7bc08266731', // GAMR
  '0x612a487212710fcdc022935ae5757facabd2881a',
  '0x3d1307f5c85d06b1c31253a12a87c1a83391d137',
  '0x3433dc3a55d9c77315cd939ad775000d31f426d5',
  '0xc9700ba01e13ed71e3909a72fe1c0c00b7918ad5',
  '0x9facd5921a80421a9f184d085bfce0041592b792',
  '0xc5e6cf3fe058e502aef70364be54bf98d7c40b21',
  '0xef40c286c6d7c90c19ffceb54d8c225daa554c3f',
  '0xcef949aaf9a0d91892eb452fb03914f40eac16dd',
  '0x3427379648109d20c27a9d22b9236f29325ccfbb',
  '0x528b5c9f4a401b230f6e15014522e1b60a15f342',
  '0xff114749aefc5e4fdb865669eb159660c988d06b',
  '0x78de1332ef4775811fff5000d5a9ebf70a665b5b',
  '0x9f0c919fd20c8ee053f4277b1a253bc46cdaa8fc',
  '0x5e6e93c97028684ff5f630dd476f5cd6b817ca2e',
  '0x71341294b022c935aca0757f6f59547d9fb65e5e',
  '0x93ff41d044c9eca47734a1fed6cd86e930351020',
  '0x7524a1cd5742d654d73e87854b376c2aa1554509',
  '0x0ef4cf2298ba3dd3840b96561749826b05d386aa',
  '0x4c72ada1b94de1731d060805b4d47ee908a43953',
  '0x20cddb160a06de6f9b45462debbe8b7a2b5eb4e0',
  '0xf81998b41c74e06bc97444190371e764d15473de',
  '0x8d5deadeec6b9118313ffee8fe3dff788a40e4ea',
  '0xa28028081804b05fe8e7b3b78dd5daf2a0488db4',
  '0xf7df8ea81caee397b15c84763f23343977652a11',
  '0xa79f25cbfe32f5f29f4ca96aae67acd49d65655f',
  '0xc12a69280f473070b01c16b7c4e9fdcfba4990cb',
  '0xabb084bac6e284af918682055c79929aa94c3c5c',
  '0x2077d0d723f007605fe818aa809e053de4f547bb',
  '0x40774a8003f8a3b3104cb6a25d3ae66d379651b2',
  '0x5617309bd091fecb212db77c796938fa31c5a12d',
  '0x1c59c4087f12d61c152644d90a4b2f3e5f9e7166',
]

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
let MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('100')

// minimum liquidity for price to get tracked
let MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('1')

/**
 * Search through graph to find derived Eth per token.
 * @todo update to be derived ETH (add stablecoin estimates)
 **/
export function findEthPerToken(token: Token): BigDecimal {
  if (token.id == WETH_ADDRESS) {
    return ONE_BD
  }
  // loop through whitelist and check if paired with any
  for (let i = 0; i < WHITELIST.length; ++i) {
    let pairAddress = factoryContract.getPair(Address.fromString(token.id), Address.fromString(WHITELIST[i]))
    if (pairAddress.toHexString() != ADDRESS_ZERO) {
      let pair = Pair.load(pairAddress.toHexString())
      if (pair === null) {
        continue
      }
      if (pair.token0 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
        let token1 = Token.load(pair.token1)
        if (token1 === null) {
          continue
        }
        return pair.token1Price.times(token1.derivedETH as BigDecimal) // return token1 per our token * Eth per token 1
      }
      if (pair.token1 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
        let token0 = Token.load(pair.token0)
        if (token0 === null) {
          continue
        }
        return pair.token0Price.times(token0.derivedETH as BigDecimal) // return token0 per our token * ETH per token 0
      }
    }
  }
  return ZERO_BD // nothing was found return 0
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD.
 * If both are, return average of two amounts
 * If neither is, return 0
 */
export function getTrackedVolumeUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token,
  pair: Pair,
): BigDecimal {
  let bundle = Bundle.load('1')!
  let price0 = token0.derivedETH.times(bundle.ethPrice)
  let price1 = token1.derivedETH.times(bundle.ethPrice)

  // dont count tracked volume on these pairs - usually rebass tokens
  if (UNTRACKED_PAIRS.includes(pair.id)) {
    return ZERO_BD
  }

  // if less than 5 LPs, require high minimum reserve amount amount or return 0
  if (pair.liquidityProviderCount.lt(BigInt.fromI32(5))) {
    let reserve0USD = pair.reserve0.times(price0)
    let reserve1USD = pair.reserve1.times(price1)
    if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      if (reserve0USD.plus(reserve1USD).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
    if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
      if (reserve0USD.times(BigDecimal.fromString('2')).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
    if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      if (reserve1USD.times(BigDecimal.fromString('2')).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
  }

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1)).div(BigDecimal.fromString('2'))
  }

  // take full value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0)
  }

  // take full value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1)
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getTrackedLiquidityUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token,
): BigDecimal {
  let bundle = Bundle.load('1')!
  let price0 = token0.derivedETH.times(bundle.ethPrice)
  let price1 = token1.derivedETH.times(bundle.ethPrice)

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1))
  }

  // take double value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).times(BigDecimal.fromString('2'))
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1).times(BigDecimal.fromString('2'))
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD
}
