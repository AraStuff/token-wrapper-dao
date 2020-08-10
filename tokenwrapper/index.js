const {encodeCallScript} = require('@aragon/test-helpers/evmScript');
const {encodeActCall, execAppMethod} = require('mathew-aragon-toolkit');
const Listr = require('listr');
const ethers = require('ethers');
const utils = require('ethers/utils');
const {keccak256} = require('web3-utils');
const chalk = require('chalk');
const {RLP} = utils;

const {dao,acl,deposit_token,voting,token_name,symbol, environment, support, quorum, time, finance} = require('./settings.json')
const provider = ethers.getDefaultProvider(environment);

const url = chalk.green


// new apps
const tokenwrapperAppId = '0xdab7adb04b01d9a3f85331236b5ce8f5fdc5eecb1eebefb6129bc7ace10de7bd';
const tokenwrapperBase = (environment === 'rinkeby') 
    ? '0xdeFe956e2FC6c6FF6c688B9c4092457fccce13cc'
    : '0x96E672A399b0E78F1B05631857F3D25c78Fabaf3'
let tokenwrapper;

const newVotingAppId = '0x9fa3927f639745e587912d4b0fea7ef9013bf93fb907d29faeab57417ba6e1d4';
const newVotingBase = (environment === 'rinkeby') 
    ? '0xb4fa71b3352D48AA93D34d085f87bb4aF0cE6Ab5'
    : '0xb935C3D80229d5D92f3761b17Cd81dC2610e3a45'
let newVoting;


// signatures
const newAppInstanceSignature = 'newAppInstance(bytes32,address,bytes,bool)';
const createPermissionSignature = 'createPermission(address,address,bytes32,address)';
const grantPermissionSignature = 'grantPermission(address,address,bytes32)'; 
const tokenwrapperInitSignature = 'initialize(address,string,string)';
const newVotingInitSignature = 'initialize(address,uint64,uint64,uint64)'; 



// functions for counterfactual addresses
async function buildNonceForAddress(_address, _index, _provider) {
    const txCount = await _provider.getTransactionCount(_address);
    return `0x${(txCount + _index).toString(16)}`;
}

async function calculateNewProxyAddress(_daoAddress, _nonce) {
    const rlpEncoded = RLP.encode([_daoAddress, _nonce]);
    const contractAddressLong = keccak256(rlpEncoded);
    const contractAddress = `0x${contractAddressLong.substr(-40)}`;

    return contractAddress;
}


async function tx1() {
    // counterfactual addresses
    const nonce0 = await buildNonceForAddress(dao, 0, provider);
    tokenwrapper = await calculateNewProxyAddress(dao, nonce0);

    const nonce1 = await buildNonceForAddress(dao, 1, provider);
    newVoting = await calculateNewProxyAddress(dao, nonce1);
  

    // app initialisation payloads
    const tokenwrapperInitPayload = await encodeActCall(tokenwrapperInitSignature, [
        deposit_token,
        token_name,
        symbol
    ])

    const newVotingInitPayload = await encodeActCall(newVotingInitSignature, [
        tokenwrapper,
        support,
        quorum,
        time
    ])


    // package first tx1
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
            keccak256('0x0000000000000000000000000000000000000000'),
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
            keccak256('CREATE_VOTES_ROLE'),
            newVoting,
        ]),
        encodeActCall(createPermissionSignature, [
            newVoting,
            newVoting,
            keccak256('MODIFY_SUPPORT_ROLE'),
            newVoting,
        ]),
        encodeActCall(createPermissionSignature, [
            newVoting,
            newVoting,
            keccak256('MODIFY_QUORUM_ROLE'),
            newVoting,
        ]),
        encodeActCall(grantPermissionSignature, [
            newVoting,
            finance,
            keccak256('CREATE_PAYMENTS_ROLE'),
        ]),
        encodeActCall(grantPermissionSignature, [
            newVoting,
            finance,
            keccak256('EXECUTE_PAYMENTS_ROLE'),
        ]),
        encodeActCall(grantPermissionSignature, [
            newVoting,
            finance,
            keccak256('MANAGE_PAYMENTS_ROLE'),
        ])
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
        'newVote',
        [
            script,
            `
            installing tokenwrapper and voting instance
            `,
        ],
        () => {},
        environment,
    );
}


const main = async () => {

    const tasks = new Listr([
        {
            title: chalk.cyan('Installing ') + chalk.cyan.bold('tokenwrapper'),
            task: () => tx1()
        }
    ])
    await tasks.run()
        .then(() =>{
            console.log(`\n--------------------------------------------------------------------------------------------------------------------------`)
            console.log('Vote at ' + url(`http://${environment}.aragon.org/#/${dao}/${voting}`))
            console.log('--------------------------------------------------------------------------------------------------------------------------')
        })
        .catch(err => {
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