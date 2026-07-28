import {StrKey} from '@stellar/stellar-sdk'

export function isValidWalletAddress(address) {
    return typeof address === 'string' && StrKey.isValidEd25519PublicKey(address)
}

/**
 * Select a wallet module and resolve its connected Stellar account.
 *
 * @param {StellarWalletsKit} kit - Wallet-kit instance
 * @param {{id: string}} selected - Selected wallet module
 * @return {Promise<{address: string, kit: StellarWalletsKit}>}
 */
export async function selectWalletAccount(kit, selected) {
    kit.setWallet(selected.id)
    const {address} = await kit.getAddress()
    if (!isValidWalletAddress(address))
        throw new Error('The selected wallet did not return a valid Stellar account address.')
    return {kit, address}
}
