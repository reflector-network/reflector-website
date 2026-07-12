const meta = {
    pubnet: {
        title: 'Stellar Pubnet',
        description: 'Price feeds for assets issued on Stellar Public Network. Calculated based on trades recorded on Stellar Classic DEX and liquidity pools.'
    },
    testnet: {
        title: 'Stellar Testnet',
        description: 'Test oracle for tokens on Stellar Testnet. Not for use in production.'
    },
    forex: {
        title: 'Foreign Exchange Rates',
        description: 'Fiat currencies exchange rates. Aggregated from multiple central banks and commercial sources.'
    },
    exchanges: {
        title: 'External CEX & DEX',
        description: 'Any cryptocurrency token, from any chain. Quoted based on data from centralized and decentralized exchanges.'
    }
}

export function resolveOracleMeta(oracle) {
    return meta[oracle.dataSource || 'exchanges']
}

export function OracleDescription({oracle}) {
    return resolveOracleMeta(oracle).description
}

export function OracleSource({oracle}) {
    return resolveOracleMeta(oracle).title + ' ' + (oracle.type === 'oracle_beam' ? "Beam" : "Pulse") + ' Oracle'
}