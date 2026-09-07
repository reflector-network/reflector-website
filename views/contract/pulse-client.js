import {PulseClient} from '@reflector/contract-client'
import {connectWalletsKit} from '../auth/wallet'
import {mainnetRpcUrl} from './oracle-contract-data'

/**
 * Create Pulse oracle client capable of signing and submitting transactions
 * @param {string} contractId
 * @return {Promise<PulseClient>}
 */
export async function createSigningPulseClient(contractId) {
    const {address, kit} = await connectWalletsKit()
    if (!address || !kit)
        throw new Error('Authentication required. Please log in.')
    return new PulseClient({
        contractId,
        publicKey: address,
        rpcUrl: mainnetRpcUrl,
        fee: '1000000',
        timeout: 600,
        //let signing errors propagate - swallowing them here would feed undefined back to the SDK
        signTransaction: (xdr, opts) => kit.signTransaction(xdr, {address, networkPassphrase: opts.networkPassphrase})
    })
}
