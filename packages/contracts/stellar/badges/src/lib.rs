#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, vec, Address, Env, Map, String, Symbol, Vec,
};

// ============================================
// DATA TYPES
// ============================================

/// Badge information
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BadgeInfo {
    pub id: u32,
    pub name: String,
    pub module_id: String,
    pub image_uri: String,
    pub earned_at: u64,
}

/// Storage keys
#[contracttype]
pub enum DataKey {
    /// Admin address
    Admin,
    /// Minter role (can mint badges)
    Minter,
    /// User badges: Map<Address, Vec<BadgeInfo>>
    UserBadges(Address),
    /// Badge metadata: Map<u32, BadgeInfo>
    BadgeMeta(u32),
    /// Total badges minted
    TotalMinted,
    /// Badge holders count per badge ID
    HolderCount(u32),
}

// ============================================
// EVENTS
// ============================================

/// Event emitted when a badge is minted
fn emit_badge_minted(env: &Env, user: &Address, badge_id: u32, timestamp: u64) {
    let topics = (symbol_short!("minted"), user.clone(), badge_id);
    env.events().publish(topics, timestamp);
}

/// Event emitted when a badge is revoked (admin only)
fn emit_badge_revoked(env: &Env, user: &Address, badge_id: u32, reason: String) {
    let topics = (symbol_short!("revoked"), user.clone(), badge_id);
    env.events().publish(topics, reason);
}

// ============================================
// CONTRACT
// ============================================

#[contract]
pub struct CryptoPetBadges;

#[contractimpl]
impl CryptoPetBadges {
    // ============================================
    // INITIALIZATION
    // ============================================

    /// Initialize the contract with admin and minter addresses
    pub fn initialize(env: Env, admin: Address, minter: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Minter, &minter);
        env.storage().instance().set(&DataKey::TotalMinted, &0u64);
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    /// Update the minter address (admin only)
    pub fn set_minter(env: Env, new_minter: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        env.storage().instance().set(&DataKey::Minter, &new_minter);
    }

    /// Register a new badge type with metadata
    pub fn register_badge(
        env: Env,
        badge_id: u32,
        name: String,
        module_id: String,
        image_uri: String,
    ) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let badge_info = BadgeInfo {
            id: badge_id,
            name,
            module_id,
            image_uri,
            earned_at: 0, // Template, will be set on mint
        };

        env.storage()
            .persistent()
            .set(&DataKey::BadgeMeta(badge_id), &badge_info);
    }

    // ============================================
    // MINTING (MINTER ROLE ONLY)
    // ============================================

    /// Mint a badge to a user (minter only)
    /// Badges are soulbound - they cannot be transferred
    pub fn mint_badge(env: Env, user: Address, badge_id: u32) {
        // Verify minter authorization
        let minter: Address = env.storage().instance().get(&DataKey::Minter).unwrap();
        minter.require_auth();

        // Check badge exists
        let badge_meta: BadgeInfo = env
            .storage()
            .persistent()
            .get(&DataKey::BadgeMeta(badge_id))
            .expect("Badge type not registered");

        // Get user's current badges
        let mut user_badges: Vec<BadgeInfo> = env
            .storage()
            .persistent()
            .get(&DataKey::UserBadges(user.clone()))
            .unwrap_or(vec![&env]);

        // Check if user already has this badge
        for badge in user_badges.iter() {
            if badge.id == badge_id {
                panic!("User already has this badge");
            }
        }

        // Create badge with current timestamp
        let timestamp = env.ledger().timestamp();
        let new_badge = BadgeInfo {
            id: badge_id,
            name: badge_meta.name,
            module_id: badge_meta.module_id,
            image_uri: badge_meta.image_uri,
            earned_at: timestamp,
        };

        // Add badge to user's collection
        user_badges.push_back(new_badge);
        env.storage()
            .persistent()
            .set(&DataKey::UserBadges(user.clone()), &user_badges);

        // Update counters
        let total: u64 = env
            .storage()
            .instance()
            .get(&DataKey::TotalMinted)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalMinted, &(total + 1));

        let holder_count: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::HolderCount(badge_id))
            .unwrap_or(0);
        env.storage()
            .persistent()
            .set(&DataKey::HolderCount(badge_id), &(holder_count + 1));

        // Emit event
        emit_badge_minted(&env, &user, badge_id, timestamp);
    }

    /// Revoke a badge from a user (admin only, emergency use)
    pub fn revoke_badge(env: Env, user: Address, badge_id: u32, reason: String) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        // Get user's badges
        let mut user_badges: Vec<BadgeInfo> = env
            .storage()
            .persistent()
            .get(&DataKey::UserBadges(user.clone()))
            .unwrap_or(vec![&env]);

        // Find and remove the badge
        let mut found = false;
        let mut new_badges: Vec<BadgeInfo> = vec![&env];

        for badge in user_badges.iter() {
            if badge.id == badge_id {
                found = true;
            } else {
                new_badges.push_back(badge);
            }
        }

        if !found {
            panic!("User does not have this badge");
        }

        // Update storage
        env.storage()
            .persistent()
            .set(&DataKey::UserBadges(user.clone()), &new_badges);

        // Update holder count
        let holder_count: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::HolderCount(badge_id))
            .unwrap_or(1);
        env.storage()
            .persistent()
            .set(&DataKey::HolderCount(badge_id), &(holder_count - 1));

        // Emit event
        emit_badge_revoked(&env, &user, badge_id, reason);
    }

    // ============================================
    // READ FUNCTIONS
    // ============================================

    /// Get all badges for a user
    pub fn get_badges(env: Env, user: Address) -> Vec<BadgeInfo> {
        env.storage()
            .persistent()
            .get(&DataKey::UserBadges(user))
            .unwrap_or(vec![&env])
    }

    /// Check if a user has a specific badge
    pub fn has_badge(env: Env, user: Address, badge_id: u32) -> bool {
        let user_badges: Vec<BadgeInfo> = env
            .storage()
            .persistent()
            .get(&DataKey::UserBadges(user))
            .unwrap_or(vec![&env]);

        for badge in user_badges.iter() {
            if badge.id == badge_id {
                return true;
            }
        }

        false
    }

    /// Get badge metadata
    pub fn get_badge_info(env: Env, badge_id: u32) -> Option<BadgeInfo> {
        env.storage()
            .persistent()
            .get(&DataKey::BadgeMeta(badge_id))
    }

    /// Get total badges minted
    pub fn get_total_minted(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::TotalMinted)
            .unwrap_or(0)
    }

    /// Get holder count for a specific badge
    pub fn get_holder_count(env: Env, badge_id: u32) -> u64 {
        env.storage()
            .persistent()
            .get(&DataKey::HolderCount(badge_id))
            .unwrap_or(0)
    }

    /// Get admin address
    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }

    /// Get minter address
    pub fn get_minter(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Minter).unwrap()
    }
}

// ============================================
// TESTS
// ============================================

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Ledger};

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CryptoPetBadges);
        let client = CryptoPetBadgesClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let minter = Address::generate(&env);

        client.initialize(&admin, &minter);

        assert_eq!(client.get_admin(), admin);
        assert_eq!(client.get_minter(), minter);
        assert_eq!(client.get_total_minted(), 0);
    }

    #[test]
    fn test_mint_badge() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, CryptoPetBadges);
        let client = CryptoPetBadgesClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let minter = Address::generate(&env);
        let user = Address::generate(&env);

        client.initialize(&admin, &minter);

        // Register a badge
        client.register_badge(
            &1,
            &String::from_str(&env, "Wallet Master"),
            &String::from_str(&env, "wallet-basics"),
            &String::from_str(&env, "ipfs://badge1"),
        );

        // Mint badge to user
        env.ledger().set_timestamp(1000);
        client.mint_badge(&user, &1);

        // Verify
        assert!(client.has_badge(&user, &1));
        assert_eq!(client.get_total_minted(), 1);
        assert_eq!(client.get_holder_count(&1), 1);

        let badges = client.get_badges(&user);
        assert_eq!(badges.len(), 1);
        assert_eq!(badges.get(0).unwrap().id, 1);
        assert_eq!(badges.get(0).unwrap().earned_at, 1000);
    }

    #[test]
    #[should_panic(expected = "User already has this badge")]
    fn test_cannot_mint_duplicate() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, CryptoPetBadges);
        let client = CryptoPetBadgesClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let minter = Address::generate(&env);
        let user = Address::generate(&env);

        client.initialize(&admin, &minter);
        client.register_badge(
            &1,
            &String::from_str(&env, "Test Badge"),
            &String::from_str(&env, "test"),
            &String::from_str(&env, "ipfs://test"),
        );

        client.mint_badge(&user, &1);
        client.mint_badge(&user, &1); // Should panic
    }
}
