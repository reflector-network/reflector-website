export const FLARE_TRANSACTION_TIMEOUT_SECONDS = 600

/**
 * Build options for the installed Reflector client. Version 0.5.3 reads the
 * misspelled callTiemout key, so both spellings are supplied during migration.
 *
 * @param {{address: string, kit: ?StellarWalletsKit}} params - Connected account and optional signing kit
 * @return {Object}
 */
export function createFlareClientOptions({address, kit}) {
    const options = {
        publicKey: address,
        defaultFee: '100000',
        callTimeout: FLARE_TRANSACTION_TIMEOUT_SECONDS,
        callTiemout: FLARE_TRANSACTION_TIMEOUT_SECONDS,
        rpcUrl: 'https://mainnet.sorobanrpc.com'
    }
    if (kit) {
        options.signTransaction = (transactionXdr, signingOptions = {}) => kit.signTransaction(transactionXdr, {
            address,
            networkPassphrase: signingOptions.networkPassphrase
        })
    }
    return options
}
