const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
  } = require('@openzeppelin/test-helpers');
// const time = require('@openzeppelin/test-helpers/src/time');
const { expect } = require('chai');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');


const FETH = artifacts.require('FETH');
const ETHFarm = artifacts.require('ETHFarm');

contract('ETHFarm', function (accounts) {
    const [owner, other, receptor1, receptor2, receptor3, proposal1] =  accounts;

    beforeEach(async function () {
        this.FETH = await FETH.new({from: owner});
        this.ETHFarm = await ETHFarm.new(this.FETH.address, {from: owner});

        const receptors = [receptor1, receptor2, receptor3];
        await this.FETH.airdrop(receptors, this.FETH.address, web3.utils.toWei('1', 'ether'), {from: owner});

    })

    it('deployer should be owner', async function () {
        expect(await this.ETHFarm.owner()).to.equal(owner);
    })

    it('mint vot by owner', async function () {
        await this.ETHFarm.mint(other, web3.utils.toWei('10', 'ether')), {from: owner};
        expect(await this.ETHFarm.balanceOf(other)).to.be.bignumber.equal(web3.utils.toWei('10', 'ether'));
        expect(await this.ETHFarm.totalSupply()).to.be.bignumber.equal(web3.utils.toWei('10', 'ether'));
    })

    it('none owner can not mint vot', async function () {
        await expectRevert(this.ETHFarm.mint(other, web3.utils.toWei('10', 'ether'), {from: other}), 'Ownable: caller is not the owner');
        expect(await this.ETHFarm.balanceOf(other)).to.be.bignumber.equal(web3.utils.toWei('0', 'ether'));
        expect(await this.ETHFarm.totalSupply()).to.be.bignumber.equal(web3.utils.toWei('0', 'ether'));
    })

    it('deposit with FETH initial', async function () {
        await this.FETH.approve(this.ETHFarm.address, web3.utils.toWei('1', 'ether'), {from: receptor1})
        const receipt = await this.ETHFarm.deposit(web3.utils.toWei('1', 'ether'), {from: receptor1});

        expect(await this.FETH.balanceOf(this.ETHFarm.address)).to.be.bignumber.equal(web3.utils.toWei('1', 'ether'));
        expect(await this.ETHFarm.balanceOf(receptor1)).to.be.bignumber.equal(web3.utils.toWei('1', 'ether'));
        expectEvent(receipt, 'Deposit', {holder: receptor1, amount: web3.utils.toWei('1', 'ether')});
    })

    it('deposit with FETH after profiting', async function () {
        //initial liquidity provider
        await this.FETH.approve(this.ETHFarm.address, web3.utils.toWei('1', 'ether'), {from: receptor1})
        const receipt = await this.ETHFarm.deposit(web3.utils.toWei('1', 'ether'), {from: receptor1});

        expect(await this.FETH.balanceOf(this.ETHFarm.address)).to.be.bignumber.equal(web3.utils.toWei('1', 'ether'));
        expect(await this.ETHFarm.balanceOf(receptor1)).to.be.bignumber.equal(web3.utils.toWei('1', 'ether'));
        expectEvent(receipt, 'Deposit', {holder: receptor1, amount: web3.utils.toWei('1', 'ether')});

        //FARM get profiting
        await this.FETH.transfer(this.ETHFarm.address, web3.utils.toWei('1', 'ether'), {from: receptor2});
        let rate = await this.ETHFarm.getCurrentRate();
        expect(rate).to.be.bignumber.equal(web3.utils.toWei('2', 'ether'));

        //now exchange rate is 2, 1 FETH for 0.5 VOT
        await this.FETH.approve(this.ETHFarm.address, web3.utils.toWei('1', 'ether'), {from: receptor3})
        await this.ETHFarm.deposit(web3.utils.toWei('1', 'ether'), {from: receptor3});
        expect(await this.ETHFarm.balanceOf(receptor3)).to.be.bignumber.equal(web3.utils.toWei('0.5', 'ether'));
    })

    it('withdraw FETH burn VOT', async function () {
        //get VOT
        await this.FETH.approve(this.ETHFarm.address, web3.utils.toWei('1', 'ether'), {from: receptor1});
        let receipt = await this.ETHFarm.deposit(web3.utils.toWei('1', 'ether'), {from: receptor1});

        expect(await this.FETH.balanceOf(this.ETHFarm.address)).to.be.bignumber.equal(web3.utils.toWei('1', 'ether'));
        expect(await this.ETHFarm.balanceOf(receptor1)).to.be.bignumber.equal(web3.utils.toWei('1', 'ether'));
        expectEvent(receipt, 'Deposit', {holder: receptor1, amount: web3.utils.toWei('1', 'ether')});
        /*---------------------------------------------------------------------------------------*/

        //withdraw
        expect(await this.FETH.balanceOf(receptor1)).to.be.bignumber.equal(web3.utils.toWei('0', 'ether'));
        receipt = await this.ETHFarm.withdraw(web3.utils.toWei('1', 'ether'), {from: receptor1});

        expect(await this.FETH.balanceOf(receptor1)).to.be.bignumber.equal(web3.utils.toWei('1', 'ether'));
        expect(await this.ETHFarm.balanceOf(receptor1)).to.be.bignumber.equal(web3.utils.toWei('0', 'ether'));
        expectEvent(receipt, 'Withdraw', {holder: receptor1, amount: web3.utils.toWei('1', 'ether')});
    })

    it('withdraw FETH burn VOT after profiting', async function () {
        //get VOT
        await this.FETH.approve(this.ETHFarm.address, web3.utils.toWei('1', 'ether'), {from: receptor1});
        let receipt = await this.ETHFarm.deposit(web3.utils.toWei('1', 'ether'), {from: receptor1});

        expect(await this.FETH.balanceOf(this.ETHFarm.address)).to.be.bignumber.equal(web3.utils.toWei('1', 'ether'));
        expect(await this.ETHFarm.balanceOf(receptor1)).to.be.bignumber.equal(web3.utils.toWei('1', 'ether'));
        expectEvent(receipt, 'Deposit', {holder: receptor1, amount: web3.utils.toWei('1', 'ether')});

        //FARM get profiting
        await this.FETH.transfer(this.ETHFarm.address, web3.utils.toWei('1', 'ether'), {from: receptor2});

        let rate = await this.ETHFarm.getCurrentRate();
        expect(rate).to.be.bignumber.equal(web3.utils.toWei('2', 'ether'));

        //withdraw now exchange rate is 1 FETH for 0.5 VOT
        expect(await this.FETH.balanceOf(receptor1)).to.be.bignumber.equal(web3.utils.toWei('0', 'ether'));
        receipt = await this.ETHFarm.withdraw(web3.utils.toWei('1', 'ether'), {from: receptor1});

        expect(await this.FETH.balanceOf(receptor1)).to.be.bignumber.equal(web3.utils.toWei('2', 'ether'));
        expect(await this.ETHFarm.balanceOf(receptor1)).to.be.bignumber.equal(web3.utils.toWei('0', 'ether'));
        expectEvent(receipt, 'Withdraw', {holder: receptor1, amount: web3.utils.toWei('1', 'ether')});
    })
    it('query a empty proposal by proposal address', async function () {
        const proposal = await this.ETHFarm.getProposal(proposal1);

        expect(proposal['0']).to.be.false;
        expect(proposal['1']).to.be.bignumber.equal('0');
    })

    it('vot a proposal', async function() {
        const receptors = [receptor1, receptor2, receptor3];

        for(let i = 0; i< receptors.length; i++) {
            await this.FETH.approve(this.ETHFarm.address, web3.utils.toWei('1', 'ether'), {from: receptors[i]})
            await this.ETHFarm.deposit(web3.utils.toWei('1', 'ether'), {from: receptors[i]});
        }

        await this.ETHFarm.vote(proposal1, {from: receptor1});

        let proposal = await this.ETHFarm.getProposal(proposal1);

        expect(proposal['0']).to.be.false;
        expect(proposal['1']).to.be.bignumber.equal(web3.utils.toWei('1', 'ether'));

        await this.ETHFarm.vote(proposal1, {from: receptor2});

        proposal = await this.ETHFarm.getProposal(proposal1);

        expect(proposal['0']).to.be.true;
        expect(proposal['1']).to.be.bignumber.equal(web3.utils.toWei('2', 'ether'));
    });

    it('freeze asset after vot can not trasnfer or vote', async function() {

        const receptors = [receptor1, receptor2, receptor3];

        for(let i = 0; i< receptors.length; i++) {
            await this.FETH.approve(this.ETHFarm.address, web3.utils.toWei('1', 'ether'), {from: receptors[i]})
            await this.ETHFarm.deposit(web3.utils.toWei('1', 'ether'), {from: receptors[i]});
        }
        let isFreezed = await this.ETHFarm.isFreezed({from: receptor1});
        expect(isFreezed).to.be.false;

        await this.ETHFarm.vote(proposal1, {from: receptor1});

        isFreezed = await this.ETHFarm.isFreezed({from: receptor1});
        expect(isFreezed).to.be.true;

        //If freezed can't transfer VOT
        await expectRevert(this.ETHFarm.transfer(other, web3.utils.toWei('1', 'ether'), {from: receptor1}), 'asset is freezed');

        //If freezed can't vote
        await expectRevert(this.ETHFarm.vote(proposal1, {from: receptor1}), 'asset is freezed');
    }) 

})