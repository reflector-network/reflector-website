import React, {useEffect, useMemo, useState} from 'react'
import {Accordion, AccountAddress} from '@stellar-expert/ui-framework'
import {fetchOracleConfig} from '../contract/oracle-contract-data'
import {OraclePriceUpdates} from './oracle-price-updates'
import OracleContractInfo from './oracle-contract-info'
import OracleNetworkSelector from './oracle-network-selector'
import {OracleSource} from '../contract/oracle-source'
import './live-price.scss'

export default function LivePriceUpdates() {
    const [config, setConfig] = useState()
    const [network, setNetwork] = useState('public')

    useEffect(() => {
        fetchOracleConfig(network)
            .then(config => setConfig(config))
    }, [network])

    const oraclesList = useMemo(() => {
        if (!config)
            return []
        return Object.values(config.contracts)
            .filter(contract => !!contract.baseAsset)
            .map(contract => {
                const key = contract.oracleId || contract.contractId
                return {
                    key,
                    title: <OracleSource oracle={contract}/>,
                    content: <div className="text-small">
                        <div>
                            <span className="dimmed">Contract: </span>
                            <AccountAddress account={key} network={network}/>
                        </div>
                        <OracleContractInfo {...{contract, network}} />
                        <OraclePriceUpdates {...{contract, network}}/>
                    </div>
                }
            })
    }, [config, network])

    if (!config)
        return null

    return <div className="live-price">
        <div className="dual-layout">
            <div><h3>LIVE PRICE FEED</h3></div>
            <div className="text-tiny" style={{paddingTop: '1.3em'}}>
                <OracleNetworkSelector onChange={setNetwork}/></div>
        </div>
        <div className="block-indent">
            <Accordion options={oraclesList}/>
        </div>
    </div>
}