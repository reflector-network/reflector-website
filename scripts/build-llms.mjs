#!/usr/bin/env node
/*
 * Generates static/llms.txt — a machine-readable index of the site for LLMs and crawlers
 * (see https://llmstxt.org). The site is a client-rendered SPA, so plain fetches only see the
 * page title; this file gives readers the site map. Full page prose lives in static/llms-full.txt.
 *
 * Drift guard: the build (and tests/llms.test.cjs) FAIL if a page in the site navigation has no
 * entry in DESCRIPTIONS below, so a newly-added page can't ship without an llms.txt description.
 */
import {readFileSync, writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {dirname, join} from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

export const SITE = {
    title: 'Reflector',
    base: 'https://reflector.network',
    summary: 'Reflector is a decentralized price-feed oracle for the Stellar network and Soroban smart contracts. ' +
        'A peer-to-peer cluster of trusted node operators aggregates on-chain and off-chain market data into ' +
        'tamper-proof, SEP-40-compatible price feeds. Reflector offers three oracles — Pulse, Beam, and Flare — ' +
        'governed by an XRF-token DAO. This site is a client-rendered single-page app; the full page text for ' +
        'machine readers is inlined in /llms-full.txt.'
}

// The single place to describe pages for machine readers. Keyed by route path.
export const DESCRIPTIONS = {
    '/': 'About Reflector — the decentralized price oracle for Stellar and Soroban.',
    '/pulse': 'Pulse oracle — free-to-read price feeds with uniform 5-minute updates (SEP-40 interface).',
    '/beam': 'Beam oracle — faster updates for a small per-call XRF fee (burned) instead of an upkeep fee.',
    '/flare': 'Flare oracle — push price feeds (formerly "Subscriptions"): cluster nodes POST a signed webhook notification when a price-change threshold or heartbeat interval fires.',
    '/flare/add': 'Create a Flare subscription — choose a price pair, change threshold, heartbeat interval, webhook URL, and initial XRF deposit.',
    '/docs': 'Getting started — integrate a Reflector price feed into a Soroban smart contract.',
    '/docs/how-it-works': 'How Reflector works — node consensus, price mechanics, and contract storage.',
    '/docs/interface': 'Pulse contract interface — SEP-40 plus Reflector extensions, with copy-ready Rust.',
    '/docs/examples': 'Worked Soroban usage examples that read Reflector prices.',
    '/dao/blueprint': 'Reflector DAO and the XRF token — governance of feeds, subscriptions, and node operators.'
}

// Enumerate the routes actually present in the site navigation (main nav + docs nav). This is the
// drift-guard set: every route here must have a DESCRIPTIONS entry.
export function navRoutes() {
    const layout = readFileSync(join(root, 'views/pages/layout-view.js'), 'utf8')
    const docs = readFileSync(join(root, 'views/docs/docs-view.js'), 'utf8')
    const routes = new Set(['/docs'])
    for (const line of layout.split('\n')) {
        if (/^\s*\/\*/.test(line)) continue // skip commented-out nav entries
        const m = line.match(/\[\s*'[^']+'\s*,\s*'(\/[^']*)'\s*]/)
        if (m) routes.add(m[1])
    }
    for (const m of docs.matchAll(/link:\s*docsRoot\s*\+\s*'(\/[a-z-]+)'/g))
        routes.add('/docs' + m[1])
    return [...routes]
}

export function buildIndex() {
    const missing = navRoutes().filter(r => !(r in DESCRIPTIONS))
    if (missing.length)
        throw new Error(`llms.txt drift: navigation routes without a DESCRIPTIONS entry in build-llms.mjs: ${missing.join(', ')}`)
    const b = SITE.base
    const item = p => `- [${b}${p}](${b}${p}): ${DESCRIPTIONS[p]}`
    return `# ${SITE.title}

> ${SITE.summary}

## Oracles
${item('/pulse')}
${item('/beam')}
${item('/flare')}
${item('/flare/add')}

## Documentation
${item('/docs')}
${item('/docs/how-it-works')}
${item('/docs/interface')}
${item('/docs/examples')}

## Governance
${item('/dao/blueprint')}

## Reference
- Authoritative contract-address registry: https://developers.stellar.org/docs/data/oracles/oracle-providers
- SEP-40 price oracle standard: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0040.md
- Organization metadata (stellar.toml): ${b}/.well-known/stellar.toml

## Optional
- [${b}/llms-full.txt](${b}/llms-full.txt): full page text inlined as markdown for machine readers.
`
}

if (import.meta.url === `file://${process.argv[1]}`) {
    writeFileSync(join(root, 'static/llms.txt'), buildIndex())
    // eslint-disable-next-line no-console
    console.log('Wrote static/llms.txt')
}
