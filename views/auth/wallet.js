import {
    StellarWalletsKit,
    WalletNetwork,
    FreighterModule,
    AlbedoModule,
    LobstrModule,
    xBullModule,
    ALBEDO_ID,
    ModalThemes
} from '@creit.tech/stellar-wallets-kit'
import {isValidWalletAddress, selectWalletAccount} from './wallet-connection'

const network = WalletNetwork.PUBLIC

const kit = new StellarWalletsKit({
    network,
    theme: ModalThemes.DARK,
    selectedWalletId: ALBEDO_ID,
    modules: [
        new AlbedoModule(),
        new FreighterModule(),
        new LobstrModule(),
        new xBullModule()
    ]
})

let connected

/**
 * @param {'default'|'enforceWalletSelection'|'readonly'} mode - Connection behavior
 * @return {Promise<{address: string, kit: StellarWalletsKit}>}
 */
export function connectWalletsKit(mode = 'default') {
    if (mode === 'readonly') {
        const address = getCurrentAccount()
        if (address)
            return Promise.resolve({address, kit: null})
    }
    return new Promise((resolve, reject) => {
        if (connected && mode !== 'enforceWalletSelection')
            return resolve(connected)
        kit.openModal({
            onClosed: error => reject(error || new Error('Wallet selection canceled.')),
            onWalletSelected: selected => {
                selectWalletAccount(kit, selected)
                    .then(connection => {
                        localStorage.setItem('authenticated', connection.address)
                        connected = connection
                        resolve(connection)
                    })
                    .catch(reject)
            }
        }).catch(reject)
    })
}

export function getCurrentAccount() {
    const address = localStorage.getItem('authenticated')
    return isValidWalletAddress(address) ? address : null
}
