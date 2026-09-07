export function generateReflectorClient() { //reflector.rs
    return `/* reflector.rs */
use soroban_sdk::{contracttype, Address, Symbol, Vec};

// Oracle contract interface exported as ReflectorClient
#[soroban_sdk::contractclient(name = "ReflectorClient")]
pub trait Contract {
    // Base oracle symbol the price is reported in
    fn base() -> Asset;
    // All assets quoted by the contract
    fn assets() -> Vec<Asset>;
    // Number of decimal places used to represent price for all assets quoted by the oracle
    fn decimals() -> u32;
    // Quotes asset price in base asset at specific timestamp
    fn price(asset: Asset, timestamp: u64) -> Option<PriceData>;
    // Quotes the most recent price for an asset
    fn lastprice(asset: Asset) -> Option<PriceData>;
    // Quotes last N price records for the given asset
    fn prices(asset: Asset, records: u32) -> Option<Vec<PriceData>>;
    // Price feed resolution (default tick period timeframe, in seconds - 5 minutes by default)
    fn resolution() -> u32;
    // Historical records retention period, in seconds (24 hours by default)
    fn history_retention_period() -> Option<u64>;
    // The most recent price update timestamp
    fn last_timestamp() -> u64;
    // Contract protocol version
    fn version() -> u32;
    // Extend price feed TTL (time-to-live) in the contract storage
    fn extend_asset_ttl(sponsor: Address, asset: Asset);
    // Get asset expiration timestamp
    fn expires(asset: Asset) -> Option<u64>;
    // Note: it's safe to remove any methods not used by the consumer contract from this client trait
}

// Quoted asset definition
#[contracttype(export = false)]
#[derive(Debug, Clone, Eq, PartialEq, Ord, PartialOrd)]
pub enum Asset {
    Stellar(Address), // for Stellar Classic and Soroban assets
    Other(Symbol)     // for any external currencies/tokens/assets/symbols
}

// Price record definition
#[contracttype(export = false)]
#[derive(Debug, Clone, Eq, PartialEq, Ord, PartialOrd)]
pub struct PriceData {
    pub price: i128,   // asset price at given point in time
    pub timestamp: u64 // record timestamp
}

// Possible runtime errors
#[soroban_sdk::contracterror(export = false)]
#[derive(Debug, Copy, Clone, Eq, PartialEq, Ord, PartialOrd)]
pub enum Error {
    AlreadyInitialized = 0,
    Unauthorized = 1,
    AssetMissing = 2,
    AssetAlreadyExists = 3,
    InvalidConfigVersion = 4,
    InvalidTimestamp = 5,
    InvalidUpdateLength = 6,
    AssetLimitExceeded = 7
}`
}

export function generateReflectorClientInvocation(contract, type, network) {
    let tickerCode = ''
    switch (type) {
        case 'pubnet':
            tickerCode = network === 'public' ? `let stellar_token_address = "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA"; // XLM token address
        let ticker = ReflectorAsset::Stellar(Address::from_str(&e, &stellar_token_address));` :
                `let stellar_token_address = "CAUIKL3IYGMERDRUN6YSCLWVAKIFG5Q4YJHUKM4S4NJZQIA3BAS6OJPK"; // AQUA token address
        let ticker = ReflectorAsset::Stellar(Address::from_str(&e, &stellar_token_address));`
            break
        case 'testnet':
            tickerCode = `let stellar_token_address = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"; // XLM token address
        let ticker = ReflectorAsset::Stellar(Address::from_str(&e, &stellar_token_address));`
            break
        case 'exchanges':
            tickerCode = `let ticker = ReflectorAsset::Other(Symbol::new(&e, &("BTC")));`
            break
        case 'forex':
            tickerCode = `let ticker = ReflectorAsset::Other(Symbol::new(&e, &("GBP")));`
            break
    }
    return `/* contract.rs */
use crate::reflector::{ReflectorClient, Asset as ReflectorAsset}; // Import Reflector interface
use soroban_sdk::{contract, contractimpl, Address, Env, String, Symbol};

#[contract]
pub struct MyAwesomeContract; // Of course, it's awesome, we know it!

#[contractimpl]
impl MyAwesomeContract {
    pub fn lets_rock(e: Env) {
        // Oracle contract address to use
        let oracle_address = Address::from_str(&e, "${contract}");
        // Create client for working with oracle
        let reflector_client = ReflectorClient::new(&e, &oracle_address);
        // Ticker to lookup the price
        ${tickerCode}
        // Fetch the most recent price record for it
        let recent = reflector_client.lastprice(&ticker);
        // Check the result
        if recent.is_none() {
            //panic_with_error!(&e, "price not available");
        }
        // Retrieve the price itself
        let price = recent.unwrap().price;

        // Do not forget for price precision, get decimals from the oracle
        // (this value can be also hardcoded once the price feed has been
        // selected because decimals never change in live oracles)
        let price_decimals = reflector_client.decimals();
        
        // Let's check how much of quoted asset we can potentially purchase for $10
        let usd_balance = 10_0000000i128; // $10 with standard Stellar token precision
        let can_purchase = (usd_balance * 10i128.pow(price_decimals)) / price;
        
        // How many USD we'll need to buy 5 quoted asset tokens?
        let want_purchase = 5_0000000i128; // 5 tokens with standard Stellar token precision
        let need_usd = (want_purchase * price) / 10i128.pow(price_decimals);
        
        // Please note: check for potential overflows or use safe math when dealing with prices
    }
}`
}
