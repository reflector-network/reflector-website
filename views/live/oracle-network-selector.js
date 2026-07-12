import React, {useCallback, useState} from 'react'
import {Dropdown} from '@stellar-expert/ui-framework'

export default function OracleNetworkSelector({value, onChange}) {
    const [network, setNetwork] = useState(value || 'public')

    const updateNetwork = useCallback(value => {
        setNetwork(value)
        onChange(value)
    }, [])

    return <>
        <Dropdown options={networks} value={network} onChange={updateNetwork}/>
    </>
}

const networks = [
    {
        value: 'public',
        title: 'MAINNET'
    },
    {
        value: 'testnet',
        title: 'TESTNET'
    }
]