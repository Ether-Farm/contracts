const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
  } = require('@openzeppelin/test-helpers');
const time = require('@openzeppelin/test-helpers/src/time');
const { expect } = require('chai');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');


const VOT = artifacts.require('Vot');

contract('VOT', function (accounts) {
    const [owner, other, farm] =  accounts;

    beforeEach(async function () {
        this.VOT = await VOT.new({from: owner});

        await expectRevert(this.VOT.setFarm(farm, {from: farm}), 'Ownable: caller is not the owner');
        await this.VOT.setFarm(farm, {from: owner});
        expect(await this.VOT.farm()).to.equal(farm);
    })

    it('mint by farm', async function () {
        await this.VOT.mint(other, web3.utils.toWei('30', 'ether'), {from: farm});

        expect(await this.VOT.balanceOf(other))
            .to.be.bignumber
            .equal(web3.utils.toWei('30', 'ether'));
    })

    it('none farm cannot mint', async function () {
       await expectRevert(this.VOT.mint(other, web3.utils.toWei('30', 'ether'), {from: owner}), 'caller is not the farm'); 
    })

    it('burn by farm', async function () {
        //mint VOT 
        await this.VOT.mint(other, web3.utils.toWei('30', 'ether'), {from: farm});

        expect(await this.VOT.balanceOf(other))
            .to.be.bignumber
            .equal(web3.utils.toWei('30', 'ether'));

        //burn VOT

        await this.VOT.burn(other, web3.utils.toWei('30', 'ether'), {from: farm});

        expect(await this.VOT.balanceOf(other))
            .to.be.bignumber
            .equal(web3.utils.toWei('0', 'ether'));
    })

    it('none farm cannot burn', async function () {
       await expectRevert(this.VOT.burn(other, web3.utils.toWei('30', 'ether'), {from: owner}), 'caller is not the farm'); 
    })

    it('freeze and can not transfer', async function () {
        //mint VOT 
        await this.VOT.mint(other, web3.utils.toWei('30', 'ether'), {from: farm});
        expect(await this.VOT.balanceOf(other))
            .to.be.bignumber
            .equal(web3.utils.toWei('30', 'ether'));

        expect(await this.VOT.isFreezed(other)).to.be.false; 
        await this.VOT.freeze(other, {from: farm});
        expect(await this.VOT.isFreezed(other)).to.be.true; 

        await expectRevert(this.VOT.transfer(owner, web3.utils.toWei('3', 'ether'), {from: other}), 'asset is freezed');
    })
    
    it('unfreeze and can transfer', async function () {
        await this.VOT.setFreezeInterval(10, {from: farm});

        //mint VOT 
        await this.VOT.mint(other, web3.utils.toWei('30', 'ether'), {from: farm});
        expect(await this.VOT.balanceOf(other))
            .to.be.bignumber
            .equal(web3.utils.toWei('30', 'ether'));
        //freeze asset    
        await this.VOT.freeze(other, {from: farm});
        expect(await this.VOT.isFreezed(other)).to.be.true; 
        let latestBlock = await time.latestBlock();
        await time.advanceBlockTo(latestBlock.add(new BN('15')));

        expect(await this.VOT.isFreezed(other)).to.be.false; 

        await this.VOT.transfer(owner, web3.utils.toWei('3', 'ether'), {from: other});
        expect(await this.VOT.balanceOf(owner))
            .to.be.bignumber
            .equal(web3.utils.toWei('3', 'ether'))

    })

});