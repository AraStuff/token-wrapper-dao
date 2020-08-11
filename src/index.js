const { encodeCallScript } = require("@aragon/test-helpers/evmScript");
const { encodeActCall, execAppMethod } = require("mathew-aragon-toolkit");
const Listr = require("listr");
const { BigNumber } = require("ethers");
const utils = require("ethers/utils");
const { keccak256 } = require("web3-utils");
const chalk = require("chalk");
const { counterfactualAddresses } = require('./helpers')


// BigNumber constants
const ONE_HUNDRED_PERCENT = 1e18
const ONE_MINUITE = 60
const ONE_HOUR = ONE_MINUITE * 60
const ONE_DAY = ONE_HOUR * 24


// DAO Addresses
const dao = 0xD5D9B55Ab9E93E416e635B440dc0F3F88F8bD7f7
const acl = 0xffa741e8463243b6cfa911fb252f5d50ce00f718
const voting = 0x4c29e776d4de3861acb522eb8a4e076550892715
const deposit_token = 0x9634747f6f0e74701168ce5cd6641feb11ec9c5b
const finance = 0x8566fdf5e8c9e5372c53b3d05e720b553321eb66
const environment = rinkeby


// DAO SETTINGS
const quorum = BigNumber.from((ONE_HUNDRED_PERCENT * 0.25).toString())
const support = BigNumber.from((ONE_HUNDRED_PERCENT * 0.5).toString())
const time = ONE_DAY
const token_name = "Wrapped Token"
const symbol = "WTKN"


// TOKEN WRAPPER 
const tokenwrapperAppId = "0xdab7adb04b01d9a3f85331236b5ce8f5fdc5eecb1eebefb6129bc7ace10de7bd";
const tokenwrapperBase = "0xdeFe956e2FC6c6FF6c688B9c4092457fccce13cc"
const tokenwrapperInitSignature = "initialize(address,string,string)";

// VOTING 
const newVotingAppId = "0x9fa3927f639745e587912d4b0fea7ef9013bf93fb907d29faeab57417ba6e1d4";
const newVotingBase = "0xb4fa71b3352D48AA93D34d085f87bb4aF0cE6Ab5"
const newVotingInitSignature = "initialize(address,uint64,uint64,uint64)";

// Kernel and ACL signatures
const newAppInstanceSignature = "newAppInstance(bytes32,address,bytes,bool)";
const createPermissionSignature ="createPermission(address,address,bytes32,address)";
const grantPermissionSignature = "grantPermission(address,address,bytes32)";


async function tx1() {
  // calculate counterfactual addresses
  const tokenwrapper = await counterfactualAddresses(dao, 0);
  const newVoting = await counterfactualAddresses(dao, 1)

  // app initialisation payloads
  const tokenwrapperInitPayload = await encodeActCall(
    tokenwrapperInitSignature,
    [deposit_token, token_name, symbol]
  );

  const newVotingInitPayload = await encodeActCall(newVotingInitSignature, [
    tokenwrapper,
    support,
    quorum,
    time,
  ]);

  // Encode indervidual function calls
  const calldatum = await Promise.all([
    encodeActCall(newAppInstanceSignature, [ 
      tokenwrapperAppId,
      tokenwrapperBase,
      tokenwrapperInitPayload,
      true,
    ]),
    encodeActCall(createPermissionSignature, [
      voting,
      tokenwrapper,
      keccak256("0x0000000000000000000000000000000000000000"),
      voting,
    ]),
    encodeActCall(newAppInstanceSignature, [
      newVotingAppId,
      newVotingBase,
      newVotingInitPayload,
      false,
    ]),
    encodeActCall(createPermissionSignature, [
      tokenwrapper,
      newVoting,
      keccak256("CREATE_VOTES_ROLE"),
      newVoting,
    ]),
    encodeActCall(createPermissionSignature, [
      newVoting,
      newVoting,
      keccak256("MODIFY_SUPPORT_ROLE"),
      newVoting,
    ]),
    encodeActCall(createPermissionSignature, [
      newVoting,
      newVoting,
      keccak256("MODIFY_QUORUM_ROLE"),
      newVoting,
    ]),
    encodeActCall(grantPermissionSignature, [
      newVoting,
      finance,
      keccak256("CREATE_PAYMENTS_ROLE"),
    ]),
    encodeActCall(grantPermissionSignature, [
      newVoting,
      finance,
      keccak256("EXECUTE_PAYMENTS_ROLE"),
    ]),
    encodeActCall(grantPermissionSignature, [
      newVoting,
      finance,
      keccak256("MANAGE_PAYMENTS_ROLE"),
    ]),
  ]);

  const actions = [
    {
      to: dao,
      calldata: calldatum[0],
    },
    {
      to: acl,
      calldata: calldatum[1],
    },
    {
      to: dao,
      calldata: calldatum[2],
    },
    {
      to: acl,
      calldata: calldatum[3],
    },
    {
      to: acl,
      calldata: calldatum[4],
    },
    {
      to: acl,
      calldata: calldatum[5],
    },
    {
      to: acl,
      calldata: calldatum[6],
    },
    {
      to: acl,
      calldata: calldatum[7],
    },
    {
      to: acl,
      calldata: calldatum[8],
    },
  ];

  const script = encodeCallScript(actions);

  await execAppMethod(
    dao,
    voting,
    "newVote",
    [
      script,
      `
            installing tokenwrapper and voting instance
            `,
    ],
    () => {},
    environment
  );
}

const main = async () => {
  const tasks = new Listr([
    {
      title: chalk.white.bold("Installing ") + chalk.cyan.bold("tokenwrapper"),
      task: () => tx1(),
    },
  ]);
  await tasks
    .run()
    .then(() => {
      console.log(
        `\n--------------------------------------------------------------------------------------------------------------------------`
      );
      console.log(
        "Vote at " + chalk.green(`http://${environment}.aragon.org/#/${dao}/${voting}`)
      );
      console.log(
        "--------------------------------------------------------------------------------------------------------------------------"
      );
    })
    .catch((err) => {
      console.error(err);
    });
};

main()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.error(e);
    process.exit();
  });
