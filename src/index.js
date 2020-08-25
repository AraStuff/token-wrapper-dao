// 0. Imports
const { encodeCallScript } = require("@aragon/test-helpers/evmScript");
const { encodeActCall, execAppMethod } = require("mathew-aragon-toolkit");
const { counterfactualAddress, encodeContractInteraction } = require("./helpers");
const { keccak256 } = require("web3-utils");


// 1.  DAO Addresses
const dao = '';
const acl = '';
const securityTokenManager = '';
const voting = '';
const finance = '';
const vault = '';
const network = 'rinkeby';


// 2. Kernel and ACL signatures
const createPermissionSignature =
  "createPermission(address,address,bytes32,address)";
const newAppInstanceSignature = "newAppInstance(bytes32,address,bytes,bool)";
const grantPermissionSignature = "grantPermission(address,address,bytes32)";
const revokePermissionSignature = "revokePermission(address,address,bytes32)";
const setPermissionManagerSignature = "setPermissionManager(address,address,bytes32)"


// 3a. TOKEN WRAPPER
const tokenwrapperAppId =
  "0xdab7adb04b01d9a3f85331236b5ce8f5fdc5eecb1eebefb6129bc7ace10de7bd";
const tokenwrapperBase = "0xdeFe956e2FC6c6FF6c688B9c4092457fccce13cc";
const tokenwrapperInitSignature = "initialize(address,string,string)";
const deposit_token = '0xf522b3512d936d3f809256a8b4abe2c458c58ed1'; // SAND
const wrapped_token_name = "Wrapped Sand Token";
const wrapped_symbol = "wSAND";


// 3b. VOTING
const newVotingAppId =
  "0x9fa3927f639745e587912d4b0fea7ef9013bf93fb907d29faeab57417ba6e1d4";
const newVotingBase = "0xb4fa71b3352D48AA93D34d085f87bb4aF0cE6Ab5";
const newVotingInitSignature = "initialize(address,uint64,uint64,uint64)";
const quorum = '100000000000000000';    // 10%
const support = '600000000000000000';   // 60%
const time = '604800';                  // 1 Week


async function createVote() {
  // 4. calculate counterfactual addresses
  const tokenwrapper = await counterfactualAddress(dao, 0, network);
  const newVoting = await counterfactualAddress(dao, 1, network);


  // 5. app initialisation payloads
  const tokenwrapperInitPayload = await encodeActCall(tokenwrapperInitSignature, [
    deposit_token,
    wrapped_token_name,
    wrapped_symbol]
  );

  const newVotingInitPayload = await encodeActCall(newVotingInitSignature, [
    tokenwrapper,
    support,
    quorum,
    time,
  ]);


  // 6. Encode individual transactions into an array
  const actions = await Promise.all([
    encodeContractInteraction(dao, newAppInstanceSignature, [
      tokenwrapperAppId,
      tokenwrapperBase,
      tokenwrapperInitPayload,
      true,
    ]),
    encodeContractInteraction(acl, createPermissionSignature, [
      voting,
      tokenwrapper,
      keccak256("0x0000000000000000000000000000000000000000"),
      voting,
    ]),
    encodeContractInteraction(dao, newAppInstanceSignature, [
      newVotingAppId,
      newVotingBase,
      newVotingInitPayload,
      false,
    ]),
    encodeContractInteraction(acl, createPermissionSignature, [
      tokenwrapper,
      newVoting,
      keccak256("CREATE_VOTES_ROLE"),
      newVoting,
    ]),
    encodeContractInteraction(acl, createPermissionSignature, [
      newVoting,
      newVoting,
      keccak256("MODIFY_SUPPORT_ROLE"),
      newVoting,
    ]),
    encodeContractInteraction(acl, createPermissionSignature, [
      newVoting,
      newVoting,
      keccak256("MODIFY_QUORUM_ROLE"),
      newVoting,
    ]),
    encodeContractInteraction(acl, grantPermissionSignature, [
      newVoting,
      finance,
      keccak256("CREATE_PAYMENTS_ROLE"),
    ]),
    encodeContractInteraction(acl, grantPermissionSignature, [
      newVoting,
      finance,
      keccak256("EXECUTE_PAYMENTS_ROLE"),
    ]),
    encodeContractInteraction(acl, grantPermissionSignature, [
      newVoting,
      finance,
      keccak256("MANAGE_PAYMENTS_ROLE"),
    ]),
    encodeContractInteraction(acl, grantPermissionSignature, [
      newVoting,
      securityTokenManager,
      keccak256("MINT_ROLE"),
    ]),
    encodeContractInteraction(acl, grantPermissionSignature, [
      newVoting,
      securityTokenManager,
      keccak256("BURN_ROLE"),
    ]),
     encodeContractInteraction(acl, grantPermissionSignature, [
      newVoting,
      dao,
      keccak256("APP_MANAGER_ROLE"),
    ]),
    encodeContractInteraction(acl, grantPermissionSignature, [
      newVoting,
      acl,
      keccak256("CREATE_PERMISSIONS_ROLE"),
    ]),
    encodeContractInteraction(acl, revokePermissionSignature, [
      voting,
      acl,
      keccak256("CREATE_PERMISSIONS_ROLE"),
    ]),
    encodeContractInteraction(acl, revokePermissionSignature, [
      voting,
      dao,
      keccak256("APP_MANAGER_ROLE"),
    ]),
    encodeContractInteraction(acl, revokePermissionSignature, [
      voting,
      securityTokenManager,
      keccak256("MINT_ROLE"),
    ]),
    encodeContractInteraction(acl, revokePermissionSignature, [
      voting,
      securityTokenManager,
      keccak256("BURN_ROLE"),
    ]),
    encodeContractInteraction(acl, revokePermissionSignature, [
      voting,
      finance,
      keccak256("CREATE_PAYMENTS_ROLE"),
    ]),
    encodeContractInteraction(acl, revokePermissionSignature, [
      voting,
      finance,
      keccak256("EXECUTE_PAYMENTS_ROLE"),
    ]),
    encodeContractInteraction(acl, revokePermissionSignature, [
      voting,
      finance,
      keccak256("MANAGE_PAYMENTS_ROLE"),
    ]),
    encodeContractInteraction(acl, setPermissionManagerSignature, [
      voting,
      dao,
      keccak256("APP_MANAGER_ROLE"),
    ]),
    encodeContractInteraction(acl, setPermissionManagerSignature, [
      voting,
      acl,
      keccak256("CREATE_PERMISSIONS_ROLE"),
    ]),
    encodeContractInteraction(acl, setPermissionManagerSignature, [
      newVoting,
      finance,
      keccak256("MANAGE_PAYMENTS_ROLE"),
    ]),
    encodeContractInteraction(acl, setPermissionManagerSignature, [
      newVoting,
      finance,
      keccak256("CREATE_PAYMENTS_ROLE"),
    ]),
    encodeContractInteraction(acl, setPermissionManagerSignature, [
      newVoting,
      finance,
      keccak256("EXECUTE_PAYMENTS_ROLE"),
    ]),
    encodeContractInteraction(acl, setPermissionManagerSignature, [
      newVoting,
      vault,
      keccak256("TRANSFER_ROLE"),
    ]),
    encodeContractInteraction(acl, setPermissionManagerSignature, [
      newVoting,
      voting,
      keccak256("CREATE_VOTES_ROLE"),
    ]),
    encodeContractInteraction(acl, setPermissionManagerSignature, [
      newVoting,
      voting,
      keccak256("MODIFY_SUPPORT_ROLE"),
    ]),
    encodeContractInteraction(acl, setPermissionManagerSignature, [
      newVoting,
      voting,
      keccak256("MODIFY_QUORUM_ROLE"),
    ]),
    encodeContractInteraction(acl, setPermissionManagerSignature, [
      newVoting,
      securityTokenManager,
      keccak256("MINT_ROLE"),
    ]),
    encodeContractInteraction(acl, setPermissionManagerSignature, [
      newVoting,
      securityTokenManager,
      keccak256("BURN_ROLE"),
    ]),
    encodeContractInteraction(acl, setPermissionManagerSignature, [
      newVoting,
      dao,
      keccak256("APP_MANAGER_ROLE"),
    ]),
    encodeContractInteraction(acl, setPermissionManagerSignature, [
      newVoting,
      acl,
      keccak256("CREATE_PERMISSIONS_ROLE"),
    ]),
  ]);

  

  // 7. Package the array of actions into a script
  const script = encodeCallScript(actions);

  // 8. Call the 'newVote()' function on the voting app passing our script
  await execAppMethod(
    dao,
    voting,
    "newVote",
    [script, "installing tokenwrapper and voting instance"],
    () => {},
    network
  );
}

const main = async () => {
  console.log('Creating vote to install TokenWrapper and Voting')
  await createVote()
  console.log(`http://${network}.aragon.org/#/${dao}/${voting}`);
};

main()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.error(e);
    process.exit();
  });
