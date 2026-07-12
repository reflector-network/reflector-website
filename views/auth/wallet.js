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
 * @param {'default'|'enforceWalletSelection'|'readonly'} mode
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
            onWalletSelected: async (selected) => {
                kit.setWallet(selected.id)
                const {address} = await kit.getAddress()
                localStorage.setItem('authenticated', address)
                connected = {kit, address}
                resolve(connected)
            }
        })
    })
}

export function getCurrentAccount() {
    return localStorage.getItem('authenticated')
}
