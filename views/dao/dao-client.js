import DaoClient from '@reflector/dao-client'
import {connectWalletsKit} from '../auth/wallet'

const contractId = 'CBQSUF57OYX4RIMCZV62DKN6JFOTEKPHIZASMJYOUOCNHGNG2P3XQLSE'

/**
 * @param {DaoClientCallback} callback
 * @param {boolean} [readOnly]
 * @return {Promise<*>}
 */
export function invokeDaoFunction(callback, readOnly = false) {
    if (readOnly)
        return processInvocation({}, callback)
    return connectWalletsKit()
        .then(auth => processInvocation(auth, callback))
}

function processInvocation({address, kit}, callback) {
    const client = new DaoClient({
        contractId,
        publicKey: address,
        rpcUrl: 'https://mainnet.sorobanrpc.com',
        signTransaction: async function (tx, {network, networkPassphrase, accountToSign}) {
            const signed = await kit.signTransaction(tx, {address: accountToSign})
            return signed
        }
    })
    return callback(client, address)
}

/**
 * @callback DaoClientCallback
 * @param {DaoClient} client
 * @param {string} address
 */