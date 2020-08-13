# Anatomy of an Toolkit script

## Outline

- What is Toolkit?
- Why use it?
- Goal of this workshop?

<br>

## Aragon Primer

What does it mean to install an app to an Aragon DAO?

- You're deploying a contract and saying that the DAO controls it.
- The ACL determines what addresses have which permissions to call functions on the contracts.
- WTF is a script registry?

<br>

## Toolkit Walkthrough

### 0. Imports

- encodeCallScript
- encodeActCall
- execAppMethod
- counterfactualAddress
- encodeContractInteraction
- keccak256

### 1. DAO addresses

- dao
- acl
- voting
- finance

> Where/how do we find these?

### 2. Kernal and ACL signatures

- newAppInstanceSignature
- createPermissionSignature
- grantPermissionSignature

### 3. Apps

- appId
- app base
- initialisation signature

> Where/how do we find these?

#### A) TOKEN WRAPPER

- deposit_token
- token_name
- symbol

#### B) Voting

- quorum
- support
- time

### 4. `counterfactualAddress()`

TBD.

### 5. App initialisation payloads

TBD.

### 6. Encode Transactions

- `encodeContractInteraction()`

### 7. Script

- What is a script?
- What apps can execute scripts?

### 8. Create vote

TBD.
