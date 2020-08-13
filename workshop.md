# Anatomy of a Toolkit script

## Outline
- What is Toolkit?
Toolkit is a library for interacting with a DAO programmatically similar to connect.
it is lower level, most of the functionality will eventually be included in toolkit
- Why use it?
batching transactions, installing apps
- Goal of this workshop?

## Aragon Primer
- App
regular smart contract that inherits from aragonOS
abstracts away governance and upgradeability
interoperable with other Aragon Apps

- Kernel
heart of the DAO
its a registry of aragon apps installed in the DAO

- ACL
another registry that includes who has permissions to do some action on an app installed in the DAO

<br>

---

### 0. Imports
- encodeCallScript
    - a call script is a set of actions can be stored and executed later by another entity
- encodeActCall
    - encodes a function call on a contract
- execAppMethod
    - helper function for sending transactions to aragon apps
- encodeContractInteraction
    - helper function for encoding calls to external contract interactions
- counterfactualAddress
    - calculates addresses for smartcontracts before they are deployed
- keccak256
    - hashing function, Aragon permissions are the keccak256 hash of the permission name

### 1. Kernal and ACL signatures
when sending transactions to smartcontracts, we need to know the signatures for the functions we want to call.
- newAppInstanceSignature
    -  installing an App on kernel
- createPermissionSignature 
    - creating permission on ACL
- grantPermissionSignature
    - granting permissions on ACL

### 2. DAO addresses
we need some addresses for the DAO
- dao
- acl
- voting
- finance

### 3. Apps
- appId
    - hash of the app ens name on APM
- app base
    - base contract address. Aragon Apps are proxies, the business logic for an app is stored in the base contract
    - upgrading an app is simply a matter of pointing to a new base contract
- initialization signature

#### A) TOKEN WRAPPER
- deposit_token
- token_name
- symbol  

#### B) Voting
- quorum
- support
- time

### 4. `counterfactualAddress()`
- gets the next app address

### 5. App initialisation payloads
- the paramaters passed to an app on initialisation
### 6. Encode Transactions
- `encodeContractInteraction()`

### 7. Script
- what is a script
- what apps can execute scripts

### 8. Create vote
