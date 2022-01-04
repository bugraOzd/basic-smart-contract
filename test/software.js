const { assert, expect } = require("chai");
const { expectRevert } = require('@openzeppelin/test-helpers');

const SoftwareToken = artifacts.require("Software");

require("chai")
  .use(require("chai-as-promised"))
  .should()

contract("Software", (accounts) => {
  let software
  before(async () => {
    software = await SoftwareToken.new()
  })

  describe("Deployed software token", async () => {
    it("has an owner", async () => {
      let owner = await software.owner()
      expect(owner).to.equal(accounts[0])
    })

    it("has a name", async () => {
      let name = await software.name()
      expect(name).to.equal("Software")
    })

    it("has a symbol", async () => {
      let symbol = await software.symbol()
      expect(symbol).to.equal("SEN")
    })

    it("has a base URI", async () => {
      let baseURI = await software.tokenURI(1)
      expect(baseURI).to.equal("https://bafkreiaykthd62x3l5dnr626otmuhtwrblrr6p3leg6lwva4h2hyjmf5ze.ipfs.dweb.link/1")
    })

    it("mints 10 token to owner", async () => {
      for (i = 1; i < 11; i++) {
        let owner = await software.ownerOf(i)
        expect(owner).to.equal(accounts[0])
      }
    })

    it('owner has 10 tokens', async () => {
      let owner = accounts[0];
      let walletOfOwner = await software.walletOfOwner(owner)
      expect(walletOfOwner).to.have.length(10)
    })
  })

  let price = web3.utils.toBN(web3.utils.toWei('0.05', 'ether'))

  describe("mint a token", async () => {
    let ownerBalanceBefore
    let buyerBalanceBefore

    before(async () => {
      ownerBalanceBefore = await web3.eth.getBalance(accounts[0]);
      ownerBalanceBefore = web3.utils.toBN(ownerBalanceBefore)

      buyerBalanceBefore = await web3.eth.getBalance(accounts[1]);
      buyerBalanceBefore = web3.utils.toBN(buyerBalanceBefore)
    })

    let reciept
    let transaction

    it("creates a token", async () => {
      reciept = await software.mint(1, { from: accounts[1], value: price })
      transaction = await web3.eth.getTransaction(reciept.tx);
    })

    it("transfers ownership to the caller", async () => {
      let owner = await software.ownerOf(11)
      expect(owner).to.equal(accounts[1])
    })

    it("costs 0.05 eth plus gas to mint", async () => {
      let buyerBalanceAfter = await web3.eth.getBalance(accounts[1])
      buyerBalanceAfter = web3.utils.toBN(buyerBalanceAfter)
      let gasCost = web3.utils.toBN(transaction.gasPrice * reciept.receipt.gasUsed)
      let expectedBuyerBalance = buyerBalanceBefore.sub(price).sub(gasCost)
      expect(buyerBalanceAfter.toString()).to.equal(expectedBuyerBalance.toString())
    })

    it("0.05 eth are transferred to the owners account", async () => {
      let ownerBalanceAfter = await web3.eth.getBalance(accounts[0])
      ownerBalanceAfter = web3.utils.toBN(ownerBalanceAfter)
      let expectedOwnerBalance = ownerBalanceBefore.add(price)
      expect(ownerBalanceAfter.toString()).to.equal(expectedOwnerBalance.toString())
    })
  })

  describe("trying to mint a token without paying", async () => {
    it("fails", async () => {
      await expectRevert(
        software.mint(1),
        "Not enough value of ETH sent."
      )
    })
  })

  describe("trying to mint more than 10 tokens", async () => {
    let mintAmount = 15
    it("fails", async () => {
      await expectRevert(
        software.mint(mintAmount, { from: accounts[1], value: mintAmount * 15 }),
        "You can not mint more than 10."
      )
    })
  })

  describe("trying admin mint", async () => {

    it("fails, you can not mint more than the max supply.", async () => {
      await expectRevert(
        software.adminMint(50000, { from: accounts[0] }),
        "You can not mint more than the max supply."
      )
    })

    it("fails, caller is not the owner", async () => {
      await expectRevert(
        software.adminMint(3, { from: accounts[1] }),
        "Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner."
      )
    })

    it("mints 15 tokens to owner in total owner has 25 tokens", async () => {
      reciept = await software.adminMint(15, { from: accounts[0] })
      transaction = await web3.eth.getTransaction(reciept.tx)

      let owner = accounts[0];
      let walletOfOwner = await software.walletOfOwner(owner)
      expect(walletOfOwner).to.have.length(25)
    })
  })
})
