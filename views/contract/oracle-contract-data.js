import {Contract, Horizon, Networks, rpc, xdr, Asset, scValToNative} from '@stellar/stellar-sdk'
import {isValidContract, stringifyQuery} from '@stellar-expert/ui-framework'

const orchestrators = {
    public: 'https://orchestrator.reflector.network',
    testnet: 'https://orchestrator-testnet.reflector.network'
}

export const mainnetRpcUrl = 'https://mainnet.sorobanrpc.com'

const horizons = {
    public: 'https://horizon.stellar.org',
    testnet: 'https://horizon-testnet.stellar.org'
}

export async function fetchOracleConfig(network) {
    const orchestratorUrl = orchestrators[network]
    return fetch(orchestratorUrl + '/config')
        .then(res => res.json())
}

export async function fetchContractInfo(adminAccount, network) {
    const horizon = new Horizon.Server(horizons[network])
    const accountInfo = await horizon.loadAccount(adminAccount)
    const signers = accountInfo.signers.filter(signer => signer.weight > 0).map(signer => signer.key)
    return {
        admin: adminAccount,
        signers,
        threshold: accountInfo.thresholds.high_threshold
    }
}

export async function fetchContractUpdates(contract, network, {cursor, limit = 1}, assets) {
    const params = {
        limit: Math.min(200, limit + 10),
        order: 'desc',
        cursor
    }
    const endpoint = `${window.explorerApiOrigin}/explorer/${network}/contract/${contract}/events${stringifyQuery(params)}`
    const events = await fetch(endpoint).then(res => res.json())
    const updates = []
    const {records} = events._embedded
    for (let event of records) {
        if (!event.topics.includes('update'))
            continue
        const body = xdr.ScVal.fromXdr(event.bodyXdr, 'base64')
        const {update_data} = scValToNative(body)
        const timestamp = parseInt(event.topics[2])
        updates.push({
            event: event.id,
            updates: {
                timestamp,
                assets: update_data.map(([asset, price]) => {
                    price = formatPrice(price, 14)
                    if (isValidContract(asset))
                        return {
                            asset: resolveContractAsset(network, assets, asset),
                            price,
                            type: 'Stellar'
                        }
                    return {
                        asset,
                        price,
                        type: 'Other'
                    }

                })
            }
        })
        if (updates.length >= limit)
            break
    }
    return updates
}

function formatPrice(price, precision) {
    let res = price.toString()
    if (res.length <= precision) {
        res = '0.' + res.padStart(precision, '0')
    } else {
        res = res.substring(0, res.length - precision) + ('.' + res.substring(res.length - precision))
    }
    return res.replace(/0+$/, '').replace(/\.$/, '')
}

const assetMapCache = new Map()

/**
 * @param {string} network
 * @param {[]} allAssets
 * @param {string} contractAsset
 * @return {string}
 */
function resolveContractAsset(network, allAssets, contractAsset) {
    const key = network + contractAsset
    let res = assetMapCache.get(key)
    if (!res) {
        //add all contract assets to the cache
        for (let a of allAssets) {
            if (a.type === 1) {
                const contractAddress = resolveAssetContractAddress(network, a.code)
                assetMapCache.set(contractAddress, a.code)
                if (contractAddress === contractAsset) {
                    res = a.code
                }
            }
        }
    }
    return res
}

function parseAsset(asset) {
    if (asset === 'XLM')
        return Asset.native()
    const [code, issuer] = asset.split(':')
    return new Asset(code, issuer)
}

export function getBaseAssetCode(contract) {
    return contract.baseAsset.type === 2 ?
        contract.baseAsset.code :
        contract.baseAsset.code.split(':')[0]
}

/**
 * Resolve Stellar asset contract address for a given oracle asset code
 * @param {string} network
 * @param {string} assetCode - asset code in CODE:ISSUER format, 'XLM', or a contract address
 * @return {string}
 */
export function resolveAssetContractAddress(network, assetCode) {
    if (isValidContract(assetCode))
        return assetCode
    return parseAsset(assetCode).contractId(Networks[network.toUpperCase()])
}

/**
 * Build a map of Stellar asset contract addresses to human-readable oracle asset codes
 * @param {string} network
 * @param {{code: string, type: number}[]} assets - assets from the oracle config
 * @return {Object.<string, string>}
 */
export function buildAssetCodeMap(network, assets) {
    const res = {}
    for (const asset of assets || []) {
        if (asset.type !== 1)
            continue
        res[resolveAssetContractAddress(network, asset.code)] = asset.code
    }
    return res
}

//instance storage props to read, everything else there is the asset->index lookup map
const instanceProps = new Set(['admin', 'assets', 'base_asset', 'decimals', 'expiration', 'last_timestamp', 'period', 'protocol', 'resolution', 'retention'])

/**
 * Read oracle contract state from its instance storage entry (single RPC call)
 * @param {string} contractId
 * @param {string} [rpcUrl]
 * @return {Promise<OracleInstanceState>}
 */
export async function fetchOracleInstance(contractId, rpcUrl = mainnetRpcUrl) {
    const server = new rpc.Server(rpcUrl)
    const {entries} = await server.getLedgerEntries(new Contract(contractId).getFootprint())
    if (!entries?.length)
        throw new Error('Contract instance not found on the ledger')
    const state = {}
    for (const entry of entries[0].val.contractData.val.instance.storage) {
        const key = scValToNative(entry.key)
        if (instanceProps.has(key)) {
            state[key] = scValToNative(entry.val)
        }
    }
    if (!state.assets)
        throw new Error('Contract is not a price oracle')
    return state
}

/**
 * Extract price feed retention config from the oracle instance state
 * @param {OracleInstanceState} instance
 * @return {{token: string, dailyFee: bigint}|null} null if retention fees are not set for the contract
 */
export function parseRetentionConfig(instance) {
    const retention = instance?.retention
    if (!Array.isArray(retention) || retention[0] !== 'Some' || !retention[1])
        return null
    const [token, dailyFee] = retention[1]
    if (!token || !(dailyFee > 0n))
        return null
    return {token, dailyFee}
}

/**
 * @typedef {{}} OracleInstanceState
 * @property {[string, string][]} assets - quoted assets as [tag, value] pairs
 * @property {bigint[]} expiration - asset expiration timestamps (in milliseconds), aligned with assets
 * @property {[string, [string, bigint]]} [retention] - retention fee config tagged union
 * @property {number} decimals
 * @property {string} admin
 */
