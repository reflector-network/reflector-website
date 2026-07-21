import React, {useCallback, useState} from 'react'
import {shortenString} from '@stellar-expert/formatter'
import {getCurrentAccount, connectWalletsKit} from './wallet'

export default function AuthStateView() {
    const [loggedInAs, setLoggedInAs] = useState(getCurrentAccount())
    const change = useCallback(event => {
        event.preventDefault()
        connectWalletsKit('enforceWalletSelection')
            .then(({address}) => setLoggedInAs(address))
            .catch(error => {
                if (!['Modal closed', 'Wallet selection canceled.'].includes(error?.message)) {
                    console.error(error)
                    notify({type: 'error', message: error?.message || 'Wallet connection failed.'})
                }
            })
    }, [setLoggedInAs])
    return <div>
        {loggedInAs ? <>
            Account: {shortenString(loggedInAs, 12)}
            <span> <a href="#" onClick={change}>change</a></span>
        </> :
        <a href="#" onClick={change}>Log in with wallet</a>}
    </div>
}
