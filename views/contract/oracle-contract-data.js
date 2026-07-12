import {Horizon, TransactionBuilder, Networks, StrKey, xdr, Asset, scValToNative} from '@stellar/stellar-sdk'
import {stringifyQuery} from '@stellar-expert/navigation'
import {isValidContract} from '@stellar-expert/asset-descriptor'

const orchestrators = {
    public: 'https://orchestrator.reflector.network',
    testnet: 'https://orchestrator-testnet.reflector.network'
}

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
        const body = xdr.ScVal.fromXDR(event.bodyXdr, 'base64')
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
        /*const parsed = parseTxDetails(tx, network, assets, baseAsset)
        if (parsed) {
            updates.push({
                tx: tx.id,
                updates: parsed.updates
            })
            if (updates.length >= limit)
                break
        }*/
    }
    return updates
}

function parseTxDetails(tx, network, assets, baseAsset) {
    const parsedTx = TransactionBuilder.fromXDR(tx.envelope_xdr, Networks[network.toUpperCase()])
    const invoke = parsedTx.operations[0]
    if (invoke.type !== 'invokeHostFunction' || invoke.func.value().functionName().toString() !== 'set_price')
        return null

    const {contractAddress, args} = invoke.func.value()._attributes
    const timestamp = Number(args[args.length - 1].value()._value / 1000n)
    const prices = args[args.length - 2].value().map(v => v.value())
    const assetPrices = prices.map((p, i) => {
        const price = p.hi()._value << 64n | prices[i].lo()._value
        const asset = assets[i]
        return {
            asset: asset.code,//asset.type === 1 ? asset.code : contract.value().toString(),
            price: formatPrice(price, 14),
            type: asset.type === 1 ? 'Stellar' : 'Other'
        }
    })
    /*const txMeta = xdr.TransactionMeta.fromXDR(tx.meta, 'base64')
    const instanceChanges = txMeta.value().operations()[0].changes().find(ch => ch._arm === 'updated').value()
    const storageUpdates = instanceChanges.data().value().val().value().storage()
    const assets = storageUpdates.find(v => {
        const key = v.key()
        return key._arm === 'str' && key.value().toString() === 'assets'
    }).val().value().map(v => v.value())
        .map(([type, contract], i) => {
            const price = prices[i].hi()._value << 64n | prices[i].lo()._value
            return {
                type: type.value().toString(),
                asset: contract._arm === 'address' ? StrKey.encodeContract(contract.value().value()) : contract.value().toString(),
                price: formatPrice(price, 14)
            }
        })*/
    //TODO: return signers who actually signed the transaction
    return {
        contract: StrKey.encodeContract(contractAddress.value()),
        updates: {
            timestamp,
            assets: assetPrices
        }
    }
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
        const networkPassphrase = Networks[network.toUpperCase()]
        //add all contract assets to the cache
        for (let a of allAssets) {
            if (a.type === 1) {
                const contractAddress = isValidContract(a.code) ?
                    a.code :
                    parseAsset(a.code).contractId(networkPassphrase)
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