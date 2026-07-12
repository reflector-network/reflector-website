import React, {useEffect, useState} from 'react'
import {AssetLink, UtcTimestamp} from '@stellar-expert/ui-framework'
import {fetchContractUpdates, getBaseAssetCode} from '../contract/oracle-contract-data'
import {PriceRecordView} from './price-record'

export function OracleFeedHistory({contract, network}) {
    const {oracleId} = contract
    const [updates, setUpdates] = useState([])

    useEffect(() => {
        setUpdates([])
        fetchContractUpdates(contract.contractId, network, {limit: 20}, contract.assets, contract.baseAsset)
            .then(res => {
                setUpdates(res.map(u => u.updates))
            })
    }, [contract.contractId, network])

    const baseAssetCode = getBaseAssetCode(contract)
    return <>
        <h3>Recent price feed updates</h3>
        <hr className="flare"/>
        <div className="text-monospace">
            {!updates.length && <div className="loader"/>}
            {updates.map(update => <div key={oracleId + update.timestamp.toString()} className="space">
                <UtcTimestamp date={update.timestamp}/>
                <div className="condensed row" style={{paddingTop: '0.2em'}}>
                    {update.assets
                        .filter(a => parseFloat(a.price) > 0)
                        .map(a => <div key={a.type + a.asset} className="column column-33">
                            {a.type === 'Other' ?
                                <b style={{minWidth: '3em', display: 'inline-block'}}>{a.asset}</b> :
                                <span style={{
                                    minWidth: '3em',
                                    display: 'inline-block'
                                }}><AssetLink asset={a.asset}/></span>}
                            {' '}<PriceRecordView price={a.price} base={baseAssetCode}/>
                        </div>)}
                </div>
            </div>)}
        </div>
        <div className="space"></div>
        <hr className="flare"/>
        <div className="space">
            <a href={`https://stellar.expert/explorer/${network}/account/${contract.admin}`} target="_blank">
                Check entire oracle history on-chain <i className="icon-open-new-window"/>
            </a>
        </div>
    </>
}