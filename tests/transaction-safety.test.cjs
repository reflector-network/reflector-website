/* Test doubles intentionally mirror asynchronous wallet APIs. */
/* eslint-disable require-await */
const assert = require('node:assert/strict')
const {readFileSync} = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')
const {Keypair, StrKey} = require('@stellar/stellar-sdk')

const root = path.resolve(__dirname, '..')

function loadExports(relativePath, names, context = {}) {
    const filename = path.join(root, relativePath)
    const source = readFileSync(filename, 'utf8')
        .replace(/^import\s+.*$/gm, '')
        .replace(/^export\s+/gm, '')
    vm.runInNewContext(`${source}\nthis.__exports = {${names.join(',')}}`, context, {filename})
    return context.__exports
}

test('wallet selection resolves a valid address and preserves connection failures', async () => {
    const {isValidWalletAddress, selectWalletAccount} = loadExports(
        'views/auth/wallet-connection.js',
        ['isValidWalletAddress', 'selectWalletAccount'],
        {StrKey}
    )
    const selected = []
    const selectedAddress = Keypair.random().publicKey()
    const kit = {
        setWallet: id => selected.push(id),
        getAddress: async () => ({address: selectedAddress})
    }
    const connection = await selectWalletAccount(kit, {id: 'freighter'})
    assert.equal(connection.kit, kit)
    assert.equal(connection.address, selectedAddress)
    assert.deepEqual(selected, ['freighter'])
    assert.equal(isValidWalletAddress(selectedAddress), true)
    assert.equal(isValidWalletAddress('GCONNECTED'), false)

    const rejected = new Error('wallet connection failed')
    await assert.rejects(
        selectWalletAccount({setWallet() {}, getAddress: async () => {
            throw rejected
        }}, {id: 'broken'}),
        error => error === rejected
    )
    await assert.rejects(
        selectWalletAccount({setWallet() {}, getAddress: async () => ({})}, {id: 'empty'}),
        /valid Stellar account address/
    )
})

test('shared action guard rejects concurrent attempts and permits retry after completion', async () => {
    const {finishAction, tryStartAction} = loadExports(
        'views/action-guard.js',
        ['finishAction', 'tryStartAction']
    )
    const flag = {current: false}
    let calls = 0
    let release
    const pending = new Promise(resolve => {
        release = resolve
    })
    const invoke = async () => {
        if (!tryStartAction(flag))
            return false
        calls++
        try {
            await pending
            return true
        } finally {
            finishAction(flag)
        }
    }

    const first = invoke()
    assert.equal(await invoke(), false)
    assert.equal(calls, 1)
    release()
    assert.equal(await first, true)
    assert.equal(await invoke(), true)
    assert.equal(calls, 2)
})

test('wallet controls close modal promises and preserve visible site links', () => {
    const wallet = readFileSync(path.join(root, 'views/auth/wallet.js'), 'utf8')
    const auth = readFileSync(path.join(root, 'views/auth/auth-state-view.js'), 'utf8')

    assert.match(wallet, /onClosed: error => reject/)
    assert.match(wallet, /selectWalletAccount\(kit, selected\)/)
    assert.match(auth, /<a href="#" onClick={change}>Log in with wallet<\/a>/)
    assert.match(auth, /event\.preventDefault\(\)/)
    assert.match(auth, /Wallet selection canceled\./)
    assert.match(auth, /Wallet connection failed/)
})
