/* eslint-disable spellcheck/spell-checker */
const { contract, web3 } = require('@openzeppelin/test-environment');
const { BN } = require('@openzeppelin/test-helpers');
const _require = require('app-root-path').require;
const BlockchainCaller = _require('/util/blockchain_caller');
const chain = new BlockchainCaller(web3);
const MockUniswapV2Pair = contract.fromArtifact('MockUniswapV2Pair');
const MockDev = contract.fromArtifact('MockDev');
const Deploy = contract.fromArtifact('Deploy');
const TokenGeyser = contract.fromArtifact('TokenGeyser');
const { TimeController } = _require('/test/helper');

const ONE_DAY = 86400;
const ONE_WEEK = ONE_DAY * 7;
const ONE_MONTH = ONE_WEEK * 4;
const DECIMALS = '000000000000000000';
let stakedToken, rewordToken, tokenGeyser;
async function generateTokenGayserInstance () {
  stakedToken = await MockUniswapV2Pair.new(new BN('10000000' + DECIMALS));
  rewordToken = await MockDev.new(new BN('10000000' + DECIMALS));
  const deploy = await Deploy.new(stakedToken.address, rewordToken.address, 100, 0, ONE_MONTH, 1);
  const tokenGeyserAddress = await deploy.getTokenGeyserAddress.call();
  tokenGeyser = await TokenGeyser.at(tokenGeyserAddress);
}

let provider1, provider2, provider3;
async function generateAddresses () {
  const accounts = await chain.getUserAccounts();
  provider1 = web3.utils.toChecksumAddress(accounts[8]);
  provider2 = web3.utils.toChecksumAddress(accounts[9]);
  provider3 = web3.utils.toChecksumAddress(accounts[10]);
}

async function getBalance (token, address) {
  const balance = (await token.balanceOf(address)).div(new BN('1' + DECIMALS));
  return balance;
}

describe('reword', function () {
  it('stake of week', async function () {
    // prepare
    await generateTokenGayserInstance();
    await generateAddresses();
    await stakedToken.transfer(provider1, new BN('100' + DECIMALS));
    await stakedToken.transfer(provider2, new BN('200' + DECIMALS));
    await stakedToken.transfer(provider3, new BN('300' + DECIMALS));

    // lock tokens
    await rewordToken.approve(tokenGeyser.address, new BN('4000' + DECIMALS));
    await tokenGeyser.lockTokens(new BN('1000' + DECIMALS), ONE_WEEK);
    await tokenGeyser.lockTokens(new BN('1000' + DECIMALS), ONE_WEEK * 2);
    await tokenGeyser.lockTokens(new BN('1000' + DECIMALS), ONE_WEEK * 3);
    await tokenGeyser.lockTokens(new BN('1000' + DECIMALS), ONE_WEEK * 4);

    // univ2 balance
    console.log('provider1 univ2 balance:' + await getBalance(stakedToken, provider1));
    console.log('provider2 univ2 balance:' + await getBalance(stakedToken, provider2));
    console.log('provider3 univ2 balance:' + await getBalance(stakedToken, provider3));

    // staking
    await stakedToken.approve(tokenGeyser.address, new BN('100' + DECIMALS), { from: provider1 });
    await tokenGeyser.stake(new BN('100' + DECIMALS), [], { from: provider1 });
    await stakedToken.approve(tokenGeyser.address, new BN('200' + DECIMALS), { from: provider2 });
    await tokenGeyser.stake(new BN('200' + DECIMALS), [], { from: provider2 });
    await stakedToken.approve(tokenGeyser.address, new BN('300' + DECIMALS), { from: provider3 });
    await tokenGeyser.stake(new BN('300' + DECIMALS), [], { from: provider3 });

    // univ2 balance
    console.log('provider1 univ2 balance:' + await getBalance(stakedToken, provider1));
    console.log('provider2 univ2 balance:' + await getBalance(stakedToken, provider2));
    console.log('provider3 univ2 balance:' + await getBalance(stakedToken, provider3));

    // passage of time
    const timeController = new TimeController();
    await timeController.initialize();
    await timeController.advanceTime(ONE_WEEK * 5);

    // unstake
    await tokenGeyser.unstake(new BN('100' + DECIMALS), [], { from: provider1 });
    await tokenGeyser.unstake(new BN('200' + DECIMALS), [], { from: provider2 });
    await tokenGeyser.unstake(new BN('300' + DECIMALS), [], { from: provider3 });

    // univ2 balance
    console.log('provider1 univ2 balance:' + await getBalance(stakedToken, provider1));
    console.log('provider2 univ2 balance:' + await getBalance(stakedToken, provider2));
    console.log('provider3 univ2 balance:' + await getBalance(stakedToken, provider3));

    // dev balance
    console.log('provider1 dev balance:' + await getBalance(rewordToken, provider1));
    console.log('provider2 dev balance:' + await getBalance(rewordToken, provider2));
    console.log('provider3 dev balance:' + await getBalance(rewordToken, provider3));
  });
});
