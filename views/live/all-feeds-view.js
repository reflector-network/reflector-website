import React, {useEffect, useState} from 'react'
import PageLayoutView from '../pages/page-layout-view'
import {fetchOracleConfig} from '../contract/oracle-contract-data'
import OracleNetworkSelector from './oracle-network-selector'
import {OracleSource, OracleDescription} from '../contract/oracle-source'
import {CopyToClipboard} from '@stellar-expert/ui-framework'
import OracleContractInfo from './oracle-contract-info'
import OracleLayout from "./oracle-layout-view";

export function AllPulseFeedsView() {
    return <AllFeedsView type="pulse"/>
}

export function AllBeamFeedsView() {
    return <AllFeedsView type="beam"/>
}

/**
 * @param {'beam'|'pulse'} type
 * @returns {JSX.Element}
 */
export default function AllFeedsView({type}) {
    const [config, setConfig] = useState()
    const [network, setNetwork] = useState('public')

    useEffect(() => {
        fetchOracleConfig(network)
            .then(config => {
                setConfig(config)
            })
    }, [network])
    let oracles
    if (config) {
        oracles = Object.values(config.contracts)
            .filter(contract => contract.type === (type === 'beam' ? 'oracle_beam' : 'oracle'))
            .map((contract, i) => <div>
                {i > 0 && <hr className="flare space"/>}
                <ContractRow {...{key: contract.contractId, contract, network}}/>
            </div>)
    }

    return <OracleLayout type={type}>
        <div>
            <div className="dual-layout" style={{width: '100%'}}>
                <div>
                    <h2>/ {type.toUpperCase()} Oracles</h2>
                </div>
                <div style={{paddingTop: '1.5em'}}>
                    <div className="space desktop-only"/>
                    <OracleNetworkSelector onChange={setNetwork}/>
                </div>
            </div>
            <hr className="flare"/>
            <div>
                {oracles ? <>
                    {oracles.length > 0 ? oracles :
                        <div className="dimmed text-center space text-small">(no {type} oracles available)</div>}
                </> : <div className="loader"/>}
            </div>
        </div>
    </OracleLayout>
}

function ContractRow({contract, network}) {
    return <div className="space">
        <a href={`/oracles/${network}/${contract.contractId}`} key={contract.contractId}>
            <h3><OracleSource oracle={contract}/> <i className="icon-arrow-right-circle"/></h3>
        </a>
        <div>
            <OracleDescription oracle={contract}/>
        </div>
        <div className="text-small micro-space">
            <div>
                <span className="dimmed">Contract: </span>
                <code className="word-break">{contract.contractId}</code><CopyToClipboard text={contract.contractId}/>
            </div>
            <OracleContractInfo contract={contract} network={network}/>
        </div>
        {contract.type === 'oracle' &&
            <div className="desktop-right text-small">
                <div className="mobile-only micro-space"/>
                <a href={`/docs/interface?network=${network}&contract=${contract.contractId}`}><i
                    className="icon-puzzle"/> USE IT IN YOUR CONTRACT</a>
            </div>}
        <div className="mobile-only micro-space"/>
    </div>
}