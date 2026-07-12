import React, {useEffect, useState} from 'react'
import {Amount, AssetLink, InfoTooltip, useExplorerApi} from '@stellar-expert/ui-framework'

const xrf = 'XRF-GCHI6I3X62ND5XUMWINNNKXS2HPYZWKFQBZZYBSMHJ4MIP2XJXSZTXRF'
const daoContract = 'CBQSUF57OYX4RIMCZV62DKN6JFOTEKPHIZASMJYOUOCNHGNG2P3XQLSE'

export default function DaoTokenStats() {
    const assetStats = useExplorerApi('asset/' + xrf)
    const daoContractBalances = useExplorerApi(`contract/${daoContract}/value`)
    /*const [stats, setStats] = useState()
    useEffect(() => {

    }, [])*/
    if (!assetStats.loaded || !daoContractBalances.loaded)
        return <div className="segment">
            <div className="loader"/>
        </div>
    if (assetStats.data?.error || daoContractBalances.data?.error)
        return <div className="segment warning">
            <div><i className="icon-warning"/> Failed to load XRF token metrics</div>
        </div>
    const current = BigInt(assetStats.data.supply)
    const total = 120_000_000_0000000n
    const daoContractBalance = BigInt(daoContractBalances.data.balances.find(t => t.asset.startsWith(xrf)).balance)
    const circulating = current - daoContractBalance
    const distribution = [
        {title: 'Locked in DAO contract', amount: daoContractBalance, color: 'hsl(193,93%,46%)'},
        {title: 'Circulating', amount: circulating, color: 'hsl(212,40%,46%)'},
        {title: 'Burned', amount: total - current, color: 'hsl(235,40%,46%)'}
    ]
    for (const record of distribution) {
        record.share = Number(100000n * record.amount / total) / 1000
    }
    return <div className="segment">
        <div className="sticky">
            <h2>/ <AssetLink asset={xrf} issuer={false} icon={false}/> token metrics</h2>
            <div>
                <div>
                    <span className="dimmed">Initial supply: </span>
                    <Amount amount={total} asset={xrf} adjust issuer={false}/>
                    <InfoTooltip>Total amount of tokens initially minted by the DAO on 2024-08-01.</InfoTooltip>
                </div>
                <div>
                    <span className="dimmed">Current supply: </span>
                    <Amount amount={assetStats.data.supply} adjust round asset={xrf} issuer={false}/>
                    <InfoTooltip>Current amount of tokens (both free circulating and locked in contracts).
                        As the tokens used for subscriptions or DAO voting get burned over time, this amount will gradually
                        decrease.</InfoTooltip>
                </div>
                <div>
                    <span className="dimmed">Circulating: </span>
                    <Amount amount={circulating} asset={xrf} issuer={false} adjust round/>
                    <InfoTooltip>Reflector unlocks 0.15% of the remaining DAO contract locked balance every week and
                        distributes these funds between node operators and protocol developers.</InfoTooltip>
                </div>
            </div>
            <div className="dual-layout space text-tiny" style={{height: '40vh', minHeight: '300px'}}>
                <div style={{width: '15%', height: '100%'}} className="text-center">
                    {distribution.map(record => <div key={record.title} style={{
                        height: record.share + '%',
                        minHeight: '1em',
                        backgroundColor: record.color
                    }}></div>)}
                </div>
                <div style={{width: '85%', paddingLeft: '1em'}} className="condensed">
                    {distribution.map(record => <div key={record.title} style={{height: record.share + '%'}}>
                        {record.title} <span className="dimmed">({record.share}%)</span>
                    </div>)}
                </div>
            </div>
            <div className="space"/>
        </div>
    </div>
}