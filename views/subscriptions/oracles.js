import {getAvailableReflectorTickers} from '@reflector/contract-client'

let dataSources

export async function getSubscriptionDataSources(network) {
    if (dataSources?.updated > new Date().getTime() - 30 * 60 * 1000)  //cache for 30 minutes
        return dataSources
    dataSources = {
        network,
        oracles: {
            exchanges: {
                assets: (await getAvailableReflectorTickers('exchanges')).map(code => ({code, type: 2})),
                baseAsset: {
                    code: 'USD',
                    type: 2
                },
                dataSource: 'exchanges',
                title: 'Aggregated CEX & DEX',
                decimals: 14,
                fee: 10000000,
                period: 86400000,
                timeframe: 300000
            },
            pubnet: {
                admin: 'GCLA2E3LQDPAPJLHYDMB5R65ASGLNXWGJCX4TX7XA75C7VTJ7Y2OTZXA',
                assets: mergeWithPredefined(await getAvailableReflectorTickers('pubnet')).map(code => ({code, type: 1})),
                baseAsset: {
                    code: 'USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
                    type: 1
                },
                dataSource: 'pubnet',
                title: 'Stellar Pubnet',
                decimals: 14,
                fee: 10000000,
                period: 86400000,
                timeframe: 300000
            }
        },
        updated: new Date().getTime()
    }
    return dataSources
}

const predefinedPubnet = ['XLM', 'AQUA:GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA', 'ARST:GCSAZVWXZKWS4XS223M5F54H2B6XPIIXZZGP7KEAIU6YSL5HDRGCI3DG', 'BTCLN:GDPKQ2TSNJOFSEE7XSUXPWRP27H6GFGLWD7JCHNEYYWQVGFA543EVBVT', 'EURC:GAQRF3UGHBT6JYQZ7YSUYCIYWAF4T2SAA5237Q5LIQYJOHHFAWDXZ7NM', 'EURC:GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2', 'FIDR:GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2', 'SSLX:GBHFGY3ZNEJWLNO4LBUKLYOCEK4V7ENEBJGPRHHX7JU47GWHBREH37UR', 'XRF:GCHI6I3X62ND5XUMWINNNKXS2HPYZWKFQBZZYBSMHJ4MIP2XJXSZTXRF', 'XRP:GBXRPL45NPHCVMFFAYZVUVFFVKSIZ362ZXFP7I2ETNQ3QKZMFLPRDTD5', 'yUSDC:GDGTVWSM4MGS4T7Z6W4RPWOCHE2I6RDFCIFZGS3DOA63LWQTRNZNTTFF']

function mergeWithPredefined(activePairs) {
    const res = [...predefinedPubnet]
    for (let asset of activePairs) {
        if (!predefinedPubnet.includes(asset)) {
            res.push(asset)
        }
    }
    return res
}