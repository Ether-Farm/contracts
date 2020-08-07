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
const XToken = artifacts.require('XToken');

contract('FETH', function (accounts) {
    const [owner, other, receptor1, receptor2, receptor3] =  accounts;

    beforeEach(async function () {
        this.FETH = await FETH.new({from: owner});
        this.XToken = await XToken.new({from: owner});
    })

    it('deployer should be owner', async function () {
        expect(await this.FETH.owner()).to.equal(owner);
    })

    it('airdrop XToken to receptors', async function () {
        const receptors = [receptor1, receptor2, receptor3];
        await this.XToken.approve(this.FETH.address, web3.utils.toWei('30', 'ether'), {from: owner});
        await this.FETH.airdrop(receptors, this.XToken.address, web3.utils.toWei('10', 'ether'), {from: owner});

        for(let i = 0; i < receptors.length; i++) {
            expect(await this.XToken.balanceOf(receptors[i])).to.be.bignumber.equal(web3.utils.toWei('10', 'ether'));
        }
        
        expect(await this.XToken.balanceOf(owner))
            .to.be.bignumber
            .equal(web3.utils.toWei('70', 'ether'));
    })
    it('airdrop FETH to receptors', async function () {
        const receptors = [receptor1, receptor2, receptor3];
        await this.FETH.airdrop(receptors, this.FETH.address, web3.utils.toWei('1', 'ether'), {from: owner});

        for(let i = 0; i < receptors.length; i++) {
            expect(await this.FETH.balanceOf(receptors[i]))
                .to.be.bignumber
                .equal(web3.utils.toWei('1', 'ether'));
        }
    })
    it('none owner can not airdrop FETH to receptors', async function () {
        const receptors = [receptor1, receptor2, receptor3];
        await expectRevert(this.FETH.airdrop(receptors, this.FETH.address, web3.utils.toWei('1', 'ether'), {from: other}), 'Ownable: caller is not the owner');
    })

    it('airdrop ETH to receptors', async function () {
        const receptors = [receptor1, receptor2, receptor3];
        await this.FETH.airdropETH(receptors, web3.utils.toWei('1', 'ether'), {from: owner, value: web3.utils.toWei(receptors.length.toString(), 'ether')});

        for(let i = 0; i < receptors.length; i++) {
            expect(await web3.eth.getBalance(receptors[i]))
                .to.be.bignumber
                .equal(web3.utils.toWei('101', 'ether'));
        }
    })

    it('none owner can not airdrop ETH to receptors', async function () {
        const receptors = [receptor1, receptor2, receptor3];
        await expectRevert(this.FETH.airdropETH(receptors, web3.utils.toWei('1', 'ether'), {from: other, value: web3.utils.toWei(receptors.length.toString(), 'ether')}), 'Ownable: caller is not the owner');
    })

    it('withdraw ETH', async function () {
        const receptors = [receptor1, receptor2, receptor3];
        await this.FETH.airdropETH(receptors, web3.utils.toWei('1', 'ether'), {from: owner, value: web3.utils.toWei('5', 'ether')});

        for(let i = 0; i < receptors.length; i++) {
            expect(await web3.eth.getBalance(receptors[i]))
                .to.be.bignumber
                .equal(web3.utils.toWei('102', 'ether'));
        }
        expect(await web3.eth.getBalance(this.FETH.address))
            .to.be.bignumber
            .equal(web3.utils.toWei('2', 'ether'));

        await this.FETH.withdraw({from: owner});

        expect(await web3.eth.getBalance(this.FETH.address))
            .to.be.bignumber
            .equal(web3.utils.toWei('0', 'ether'));
    })

    it('none owner can not withdraw ETH', async function () {
        const receptors = [receptor1, receptor2, receptor3];
        await this.FETH.airdropETH(receptors, web3.utils.toWei('1', 'ether'), {from: owner, value: web3.utils.toWei('5', 'ether')});

        for(let i = 0; i < receptors.length; i++) {
            expect(await web3.eth.getBalance(receptors[i]))
                .to.be.bignumber
                .equal(web3.utils.toWei('103', 'ether'));
        }
        expect(await web3.eth.getBalance(this.FETH.address))
            .to.be.bignumber
            .equal(web3.utils.toWei('2', 'ether'));

        await expectRevert(this.FETH.withdraw({from: other}), 'Ownable: caller is not the owner');

        expect(await web3.eth.getBalance(this.FETH.address))
            .to.be.bignumber
            .equal(web3.utils.toWei('2', 'ether'));
    })
})