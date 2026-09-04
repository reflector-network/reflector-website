import React, {useEffect, useState} from 'react'
import {AccountAddress, CopyToClipboard, Tabs, useParams} from '@stellar-expert/ui-framework'
import PageLayoutView from '../pages/page-layout-view'
import {fetchOracleConfig} from '../contract/oracle-contract-data'
import {OracleDescription, OracleSource} from '../contract/oracle-source'
import OracleContractInfo from './oracle-contract-info'
import {OracleFeedHistory} from './oracle-feed-history'
import OracleLayout from "./oracle-layout-view";

export default function OracleFeedView() {
    const {network, address} = useParams()
    const [contract, setContract] = useState()

    useEffect(() => {
        fetchOracleConfig(network)
            .then(config => {
                setContract(config.contracts[address])
            })
    }, [network])

    if (!contract)
        return <div className="loader"/>

    return <OracleLayout type={contract.type === 'oracle_beam' ? 'beam' : 'pulse'}>
        <div>
            <h2>/ <OracleSource oracle={contract}/>{' '}
                <AccountAddress name={false} account={address} network={network} chars={12}/></h2>
            <hr className="flare"/>
            <OracleDescription oracle={contract}/>
            <div className="micro-space text-small">
                <div>
                    <span className="dimmed">Contract: </span>
                    <code className="word-break">{contract.contractId}</code>
                    <CopyToClipboard text={contract.contractId}/>
                </div>
                <div>
                    <span className="dimmed">Network: </span>
                    {network === 'public' ? 'Mainnet' : 'Testnet'}
                </div>
                <OracleContractInfo {...{contract, network}}/>
            </div>
            {contract.type === 'oracle' && <div className="micro-space text-small">
                <a href={`/docs/interface?network=${network}&contract=${contract.contractId}`}>
                    <i className="icon-puzzle"/> USE IT IN YOUR SMART CONTRACT</a>
            </div>}
        </div>
        <div className="double-space">
            <OracleFeedHistory {...{contract, network}}/>
        </div>
    </OracleLayout>
}