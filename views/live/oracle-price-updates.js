import React, {useEffect, useMemo, useState} from 'react'
import {Accordion, AssetLink, UtcTimestamp} from '@stellar-expert/ui-framework'
import {fetchContractUpdates, getBaseAssetCode} from '../contract/oracle-contract-data'
import {PriceRecordView} from './price-record'

export function OraclePriceUpdates({contract, network}) {
    const {oracleId} = contract
    const [updates, setUpdates] = useState([])

    useEffect(() => {
        setUpdates([])
        fetchContractUpdates(contract.contractId, network, {limit: 3}, contract.assets, contract.baseAsset)
            .then(res => {
                setUpdates(res.map(u => u.updates))
            })
    }, [contract.contractId, network])

    const baseAssetCode = getBaseAssetCode(contract)

    const updatesList = useMemo(() => updates.map(update => ({
        key: oracleId + update.timestamp.toString(),
        title: <UtcTimestamp date={update.timestamp}/>,
        content: <div className="condensed">
            {update.assets
                .filter(a => parseFloat(a.price) > 0)
                .map(a => <div key={a.type + a.asset}>
                    {a.type === 'Other' ?
                        <b style={{minWidth: '4em', display: 'inline-block'}}>{a.asset}</b> :
                        <span style={{
                            minWidth: '7em',
                            display: 'inline-block'
                        }}><AssetLink asset={a.asset}/></span>}
                    {' '}<PriceRecordView price={a.price} base={baseAssetCode}/>
                </div>)}
        </div>
    })) || [], [updates, network])
    if (!updates?.length)
        return null

    return <>
        <div>
            Recent price feed updates:
            <div className="block-indent text-monospace">
                <Accordion options={updatesList}/>
            </div>
        </div>
        <hr className="flare"/>
    </>
}