import React, {useEffect, useState} from 'react'
import {AssetLink} from '@stellar-expert/ui-framework'
import {fetchContractInfo} from '../contract/oracle-contract-data'

export default function OracleContractInfo({contract, network}) {
    const [info, setInfo] = useState()

    useEffect(() => {
        setInfo(null)
        fetchContractInfo(contract.admin, network)
            .then(contractInfo => {
                setInfo({...contractInfo, network})
            })
    }, [contract.contractId, network])

    if (info?.network !== network)
        return null

    return <>
        <div>
            <span className="dimmed">Status: </span>
            live <span> ({info.threshold}-of-{info.signers.length} multisig)</span>
            <span className="streaming-indicator"/>
        </div>
        <div>
            {/*<span className="dimmed">Type: </span> {contract.type === 'oracle_beam' ? "Beam" : "Pulse"}<br/>
*/}            <span className="dimmed">Base symbol: </span> {contract.baseAsset.type === 2 ? contract.baseAsset.code :
            <AssetLink asset={contract.baseAsset.code}/>}<br/>
            <span className="dimmed">Decimals: </span>{contract.decimals || 14}<br/>
            <span className="dimmed">Sampling: </span>{contract.timeframe / 1000 / 60} minutes<br/>
            <span className="dimmed">Retention: </span>{contract.period / 1000 / 60 / 60} hours
        </div>
    </>
}