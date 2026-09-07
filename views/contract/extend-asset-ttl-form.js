import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Button, UtcTimestamp} from '@stellar-expert/ui-framework'
import {fromStroops, toStroops} from '@stellar-expert/formatter'
import AuthStateView from '../auth/auth-state-view'
import {getCurrentAccount} from '../auth/wallet'
import {createSigningPulseClient} from './pulse-client'
import {formatDuration} from './duration-format'

const dayMs = 86400000n

/**
 * Inline asset price feed retention extension form
 * @param {{code: string, descriptor: string, expires: bigint}} asset - asset to extend
 * @param {string} contractId - Pulse oracle contract address
 * @param {bigint} dailyFee - daily retention fee, in stroops
 * @param {function} onClose
 * @param {function} onExtended - called once the transaction has been submitted
 */
export default function ExtendAssetTtlForm({asset, contractId, dailyFee, onClose, onExtended}) {
    const [amount, setAmount] = useState('')
    const [inProgress, setInProgress] = useState(false)
    const mounted = useRef(true)

    useEffect(() => {
        mounted.current = true
        return () => {
            mounted.current = false
        }
    }, [])

    const extend = useCallback(() => {
        setInProgress(true)
        createSigningPulseClient(contractId)
            .then(client => client.extendAssetTtl(getCurrentAccount(), asset.descriptor, toStroops(amount.trim())))
            .then(() => {
                notify({type: 'success', message: 'Asset price feed retention extended'})
                onExtended()
                onClose()
            })
            .catch(e => {
                console.error(e)
                notify({type: 'error', message: e.message ? 'Execution error: ' + e.message : e})
            })
            .finally(() => {
                if (mounted.current) {
                    setInProgress(false)
                }
            })
    }, [contractId, asset, amount, onClose, onExtended])

    const trimmed = amount.trim()
    //toStroops() returns 0n both for zero and for malformed input, so check the raw value first
    const stroops = trimmed ? toStroops(trimmed) : 0n
    const extension = stroops > 0n ? stroops * dayMs / dailyFee : 0n
    const now = Date.now()
    const expires = asset.expires ? Number(asset.expires) : 0
    const expired = expires <= now
    const newExpiration = (expired ? now : expires) + Number(extension)

    return <div className="micro-space">
        <div className="row">
            <div className="column column-50">
                <label>
                    <span>XRF amount to burn: </span>
                    <input type="text" className="text-right" style={{width: '9em'}} value={amount}
                           onChange={e => setAmount(e.target.value.trim())}/>
                </label>
            </div>
            <div className="column column-50 text-small">
                <div className="segment">
                    <div>
                        <span className="dimmed">Retention fee: </span>
                        {fromStroops(dailyFee)} XRF per day
                    </div>
                    <div>
                        <span className="dimmed">Extension: </span>
                        {extension > 0n ? '+' + formatDuration(extension) : <span className="dimmed">&mdash;</span>}
                    </div>
                    <div>
                        <span className="dimmed">New expiration: </span>
                        {extension > 0n ? <UtcTimestamp date={newExpiration}/> : <span className="dimmed">&mdash;</span>}
                    </div>
                </div>
                {!!expired && extension > 0n && <div className="dimmed text-tiny">
                    The asset is already expired, so the new expiration is counted from now
                </div>}
                {!!trimmed && stroops <= 0n && <div className="text-tiny">
                    Please provide a valid amount
                </div>}
                {stroops > 0n && extension === 0n && <div className="text-tiny">
                    The amount is too small to extend the expiration
                </div>}
            </div>
        </div>
        <div className="row space">
            <div className="column column-25">
                <Button block small disabled={extension === 0n || inProgress} loading={inProgress} onClick={extend}>Extend</Button>
            </div>
            <div className="column column-25">
                <Button block small outline onClick={onClose}>Cancel</Button>
            </div>
            <div className="column column-50 text-small desktop-right micro-space">
                <AuthStateView/>
            </div>
        </div>
    </div>
}
