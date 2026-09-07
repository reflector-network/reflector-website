import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {AssetLink, CopyToClipboard, UtcTimestamp, useParams, usePageMetadata} from '@stellar-expert/ui-framework'
import {fromStroops} from '@stellar-expert/formatter'
import OracleLayout from '../live/oracle-layout-view'
import {OracleSource} from './oracle-source'
import {buildAssetCodeMap, fetchOracleConfig, fetchOracleInstance, parseRetentionConfig} from './oracle-contract-data'
import {formatDuration} from './duration-format'
import ExtendAssetTtlForm from './extend-asset-ttl-form'

export default function ExtendAssetTtlView() {
    const {network, address} = useParams()
    const [state, setState] = useState()
    const [error, setError] = useState(null)
    const [selected, setSelected] = useState(null)
    const [revision, setRevision] = useState(0)
    const mainnet = network === 'public'

    usePageMetadata({
        title: 'Extend price feed TTL',
        description: 'Extend price feed retention period for assets quoted by a Reflector Pulse oracle'
    })

    useEffect(() => {
        if (!mainnet)
            return
        let active = true
        setError(null)
        //oracle config provides human-readable asset codes, the instance entry - assets, expirations, and retention fees
        fetchOracleConfig(network)
            .then(async config => {
                const contract = config.contracts[address] || null
                if (!contract || contract.type !== 'oracle') //skip the ledger read for anything that is not a Pulse oracle
                    return {contract, instance: null}
                return {contract, instance: await fetchOracleInstance(address)}
            })
            .then(res => {
                if (active) {
                    setState(res)
                }
            })
            .catch(e => {
                if (active) {
                    console.error(e)
                    setError(e.message || 'Failed to load oracle contract data')
                }
            })
        return () => {
            active = false
        }
    }, [network, address, mainnet, revision])

    const reload = useCallback(() => setRevision(v => v + 1), [])
    const closeForm = useCallback(() => setSelected(null), [])

    const codeMap = useMemo(() => buildAssetCodeMap(network, state?.contract?.assets), [network, state])

    if (!mainnet)
        return <ExtendTtlLayout>
            <div className="space dimmed text-center">Price feed retention can be extended on the mainnet oracles only</div>
        </ExtendTtlLayout>

    if (error)
        return <ExtendTtlLayout>
            <div className="space text-center">
                <div>Failed to load oracle contract</div>
                <div className="dimmed text-small">{error}</div>
                <div className="space"><a href="#" onClick={e => {
                    e.preventDefault()
                    reload()
                }}>Retry</a></div>
            </div>
        </ExtendTtlLayout>

    if (!state)
        return <ExtendTtlLayout>
            <div className="loader"/>
        </ExtendTtlLayout>

    const {contract, instance} = state
    if (!contract)
        return <ExtendTtlLayout>
            <div className="space dimmed text-center">Unknown oracle contract</div>
        </ExtendTtlLayout>
    if (contract.type !== 'oracle')
        return <ExtendTtlLayout>
            <div className="space dimmed text-center">This contract is not a Pulse oracle</div>
        </ExtendTtlLayout>

    const retention = parseRetentionConfig(instance)
    const now = Date.now()
    const assets = new Map()
    instance.assets.forEach(([tag, descriptor], i) => {
        assets.set(descriptor, {
            descriptor,
            stellar: tag === 'Stellar',
            code: codeMap[descriptor] || descriptor,
            expires: instance.expiration?.[i]
        })
    })

    const extendTtl = e => {
        e.preventDefault()
        const {asset} = e.target.dataset
        setSelected(prev => prev?.descriptor === asset ? null : assets.get(asset)) //toggle the form for the clicked asset
    }

    return <ExtendTtlLayout>
        <div>
            <h2>/ Extend price feed TTL</h2>
            <hr className="flare"/>
            <div className="micro-space text-small">
                <div>
                    <span className="dimmed">Oracle: </span><OracleSource oracle={contract}/>
                </div>
                <div>
                    <span className="dimmed">Contract: </span>
                    <code className="word-break">{contract.contractId}</code>
                    <CopyToClipboard text={contract.contractId}/>
                </div>
                <div>
                    <span className="dimmed">Retention fee: </span>
                    {retention ? <>{fromStroops(retention.dailyFee)} XRF per day</> :
                        <span className="dimmed">not available for this oracle</span>}
                </div>
            </div>
            <div className="micro-space text-small">
                <a href={`/oracles/${network}/${address}`}><i className="icon-arrow-left-circle"/> BACK TO THE PRICE FEED</a>
            </div>
        </div>
        <div className="space">
            <p className="text-small dimmed">
                Reflector nodes keep quoting an asset while its price feed retention period lasts. Anyone can
                extend it by burning XRF tokens — the expiration date grows proportionally to the amount burned.
            </p>
            <table className="table">
                <thead>
                <tr>
                    <th>Asset</th>
                    <th className="desktop-right">Expires</th>
                </tr>
                </thead>
                <tbody>
                {Array.from(assets.values()).map(asset => <React.Fragment key={asset.descriptor}>
                    <tr>
                        <td data-header="Asset: ">
                            {asset.stellar ? <AssetLink asset={asset.code} link={false}/> : asset.code}
                        </td>
                        <td data-header="Expires: " className="desktop-right">
                            {!!retention && <a href="#" data-asset={asset.descriptor} onClick={extendTtl}
                                               title={selected?.descriptor === asset.descriptor ? 'Cancel' : 'Extend'}
                                               className="icon-arrow-up-circle"/>}
                            &nbsp;
                            <AssetExpiration expires={asset.expires} now={now}/>
                        </td>
                    </tr>
                    {selected?.descriptor === asset.descriptor && <tr>
                        <td colSpan={2}>
                            <ExtendAssetTtlForm asset={asset} contractId={contract.contractId}
                                                dailyFee={retention.dailyFee} onClose={closeForm} onExtended={reload}/>
                        </td>
                    </tr>}
                </React.Fragment>)}
                </tbody>
            </table>
        </div>
    </ExtendTtlLayout>
}

function ExtendTtlLayout({children}) {
    return <OracleLayout type="pulse">{children}</OracleLayout>
}

function AssetExpiration({expires, now}) {
    if (!expires)
        return <span className="dimmed">not set</span>
    const timestamp = Number(expires)
    return <span className="text-small">
        <span>
            {timestamp > now ? ' in ' + formatDuration(timestamp - now) : ' (expired)'}
        </span>{' '}
        <UtcTimestamp date={timestamp} className="dimmed"/>
    </span>
}
