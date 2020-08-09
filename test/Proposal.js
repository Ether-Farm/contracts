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
const Pause = artifacts.require('PauseDeposit');
const Open = artifacts.require('OpenDeposit');
const Compound = artifacts.require('CompoundDeposit');
const MockCETH = artifacts.require('MockCETH');

contract('Proposal', function (accounts) {
    const [owner, other, farm, receptor1, receptor2, receptor3, proposal1] =  accounts;

    beforeEach(async function () {

        this.FETH = await FETH.new({from: owner});
        this.VOT = await VOT.new({from: owner});
        this.ETHFarm = await ETHFarm.new(this.FETH.address, this.VOT.address, {from: owner});

        await this.FETH.send(web3.utils.toWei("0.011","ether"), { from: owner });
        await this.VOT.setFarm(this.ETHFarm.address, {from: owner});
        expect(await this.VOT.farm()).to.equal(this.ETHFarm.address);

        const receptors = [receptor1, receptor2, receptor3];
        await this.FETH.airdrop(receptors, this.FETH.address, web3.utils.toWei('2', 'ether'), {from: owner});

        for (let i = 0; i < receptors.length; i++) {
            await this.FETH.approve(this.ETHFarm.address, web3.utils.toWei('1', 'ether'), {from: receptors[i]})
            const receipt = await this.ETHFarm.deposit(web3.utils.toWei('1', 'ether'), {from: receptors[i]});
            expect(await this.VOT.balanceOf(receptors[i])).to.be.bignumber.equal(web3.utils.toWei('1', 'ether'));
        }
        this.Pause = await Pause.new(this.ETHFarm.address, {from: owner});
        this.Open = await Open.new(this.ETHFarm.address, {from: owner});

        this.MockCETH = await MockCETH.new({from: owner});
        this.Compound = await Compound.new(this.ETHFarm.address, this.FETH.address, this.MockCETH.address,{from: owner});

        expect(await this.Pause.farm()).to.equal(this.ETHFarm.address);
        expect(await this.Open.farm()).to.equal(this.ETHFarm.address);
        expect(await this.Compound.farm()).to.equal(this.ETHFarm.address);

        expect(await this.Pause.SUMMARY()).to.equal('proposal for pause farm deposit');
        expect(await this.Open.SUMMARY()).to.equal('proposal for open farm deposit');
        expect(await this.Compound.SUMMARY()).to.equal('proposal for deposit to compound');
        // await this.Compound.send(web3.utils.toWei("0.011","ether"), { from: owner });
    })
    describe('pause deposit proposal', function() {

        it('vote to pause deposit', async function () {

            await this.ETHFarm.vote(this.Pause.address, {from: receptor1});

            let proposal = await this.ETHFarm.getProposal(this.Pause.address);
            let latestBlock = await time.latestBlock();

            expect(proposal['0']).to.be.false;
            expect(proposal['1']).to.be.bignumber.equal(web3.utils.toWei('1', 'ether'));
            expect(proposal['2']).to.be.bignumber.equal(latestBlock.add(await this.VOT.freezeInterval()));
            let expired = proposal['2'];

            expect(await this.Pause.status()).to.be.false;

            await this.ETHFarm.vote(this.Pause.address, {from: receptor2});
            proposal = await this.ETHFarm.getProposal(this.Pause.address);
            expect(proposal['0']).to.be.true;
            expect(proposal['1']).to.be.bignumber.equal(web3.utils.toWei('2', 'ether'));
            expect(proposal['2']).to.be.bignumber.equal(expired);
            expect(await this.Pause.status()).to.be.true;

            await this.FETH.approve(this.ETHFarm.address, web3.utils.toWei('1', 'ether'), {from: receptor3})
            await expectRevert(this.ETHFarm.deposit(web3.utils.toWei('1', 'ether')), "Pausable: paused")
        })

    })

    describe('open deposit proposal', function() {
        it('vote to unactive pause deposit', async function () {
            //pause deposit first
            await this.ETHFarm.vote(this.Pause.address, {from: receptor1});
            await this.ETHFarm.vote(this.Pause.address, {from: receptor2});
            expect(await this.ETHFarm.paused()).to.be.true;

            let latestBlock = await time.latestBlock();
            await time.advanceBlockTo(latestBlock.add(new BN('120')));

            await this.ETHFarm.unActiveVot(this.Pause.address, {from: receptor1});
            await this.ETHFarm.unActiveVot(this.Pause.address, {from: receptor2});

            expect(await this.ETHFarm.paused()).to.be.false;

            expect(await this.ETHFarm.getProposalNumber()).to.be.bignumber.equal(new BN('1'));
            const pausProposal = await this.ETHFarm.getProposalByIndex(0);
            expect(pausProposal['0'].toString()).to.be.equal(this.Pause.address);

            // const openProposal = await this.ETHFarm.getProposalByIndex(1);
            // expect(openProposal['0'].toString()).to.be.equal(this.Open.address);
        })

    })

    describe('compound proposal', function() {
        it('should deposit eth to compound', async function () {
            await this.ETHFarm.vote(this.Compound.address, {from: receptor1});
            await expectRevert(this.ETHFarm.vote(this.Compound.address, {from: receptor1}), 'asset is freezed');
            await this.ETHFarm.vote(this.Compound.address, {from: receptor2});
            expect(await this.MockCETH.balanceOf(this.Compound.address)).to.be.bignumber.equal('54909636');
            
            let balance = await this.Compound.getBalance(); 
            expect(balance).to.be.bignumber.equal(new BN('10999999824457598'));

            await this.FETH.approve(this.ETHFarm.address, web3.utils.toWei('1', 'ether'), {from: receptor3})
            await this.ETHFarm.deposit(web3.utils.toWei('1', 'ether'), {from: receptor3});

            // await this.Compound.unActive();
            // expect(await web3.eth.getBalance(this.Compound.address)).to.be.bignumber.equal(new BN('10999999824457598'));

        })
 
        it('close compound deposit proposal', async function () {

            await this.ETHFarm.vote(this.Compound.address, {from: receptor1});
            await this.ETHFarm.vote(this.Compound.address, {from: receptor2});

            expect(await this.MockCETH.balanceOf(this.Compound.address)).to.be.bignumber.equal('54909636');
            
            let balance = await this.Compound.getBalance(); 
            expect(balance).to.be.bignumber.equal(new BN('10999999824457598'));

            let latestBlock = await time.latestBlock();
            await time.advanceBlockTo(latestBlock.add(new BN('120')));

            // await this.ETHFarm.closeCompound(this.Compound.address, {from: receptor1});

            await this.ETHFarm.unActiveVot(this.Compound.address, {from: receptor1});
            await this.ETHFarm.unActiveVot(this.Compound.address, {from: receptor2});

            expect(await web3.eth.getBalance(this.ETHFarm.address)).to.be.bignumber.equal(new BN('10999999824457598'));
            expect(await this.MockCETH.balanceOf(this.Compound.address)).to.be.bignumber.equal('0');
 
        })
    })

 
})