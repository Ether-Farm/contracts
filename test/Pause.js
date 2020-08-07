const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
  } = require('@openzeppelin/test-helpers');
const time = require('@openzeppelin/test-helpers/src/time');
const { expect } = require('chai');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

const FETH = artifacts.require('FETH');
const VOT = artifacts.require('Vot');
const ETHFarm = artifacts.require('ETHFarm');
const Pause = artifacts.require('Pause');

contract('Pause', function (accounts) {
    const [owner, other, farm, receptor1, receptor2, receptor3, proposal1] =  accounts;

    beforeEach(async function () {

        this.FETH = await FETH.new({from: owner});
        this.VOT = await VOT.new({from: owner});
        this.ETHFarm = await ETHFarm.new(this.FETH.address, this.VOT.address, {from: owner});

        await this.VOT.setFarm(this.ETHFarm.address, {from: owner});
        expect(await this.VOT.farm()).to.equal(this.ETHFarm.address);

        const receptors = [receptor1, receptor2, receptor3];
        await this.FETH.airdrop(receptors, this.FETH.address, web3.utils.toWei('1', 'ether'), {from: owner});

        for (let i = 0; i < receptors.length; i++) {
            await this.FETH.approve(this.ETHFarm.address, web3.utils.toWei('1', 'ether'), {from: receptors[i]})
            const receipt = await this.ETHFarm.deposit(web3.utils.toWei('1', 'ether'), {from: receptors[i]});
            expect(await this.VOT.balanceOf(receptors[i])).to.be.bignumber.equal(web3.utils.toWei('1', 'ether'));
        }

        this.Pause = await Pause.new(this.ETHFarm.address, {from: owner});
        expect(await this.Pause.farm()).to.equal(this.ETHFarm.address);
    })

    it('vote to pause deposit', async function () {
        await this.ETHFarm.vote(this.Pause.address, {from: receptor1});

        let proposal = await this.ETHFarm.getProposal(this.Pause.address);
        expect(proposal['0']).to.be.false;
        expect(proposal['1']).to.be.bignumber.equal(web3.utils.toWei('1', 'ether'));
        expect(await this.Pause.status()).to.be.false;

        await this.ETHFarm.vote(this.Pause.address, {from: receptor2});
        proposal = await this.ETHFarm.getProposal(this.Pause.address);
        expect(proposal['0']).to.be.true;
        expect(proposal['1']).to.be.bignumber.equal(web3.utils.toWei('2', 'ether'));
        expect(await this.Pause.status()).to.be.true;
    })
})