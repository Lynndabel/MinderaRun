import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { 
  createPlayer, 
  expectPlayerStats,
  increaseTime
} from "../helpers/helpers";

describe("NFTMarketplace", function () {
  let MindoraRunner: any;
  let mindoraRunner: any;
  let NFTMarketplace: any;
  let nftMarketplace: any;
  let owner: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  // Constants
  const TOKEN_ID = 1;
  const LISTING_PRICE = ethers.utils.parseEther("0.1");
  const ROYALTY_PERCENTAGE = 5; // 5%

  before(async function () {
    // Get signers
    [owner, player1, player2, ...addrs] = await ethers.getSigners();

    // Deploy the MindoraRunner contract
    const MindoraRunnerFactory = await ethers.getContractFactory("MindoraRunnerFinal");
    mindoraRunner = await MindoraRunnerFactory.deploy();
    await mindoraRunner.deployed();

    // Deploy the NFTMarketplace contract
    const NFTMarketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = await NFTMarketplaceFactory.deploy(mindoraRunner.address);
    await nftMarketplace.deployed();

    // Set the marketplace address in the MindoraRunner contract
    await mindoraRunner.setMarketplace(nftMarketplace.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await nftMarketplace.owner()).to.equal(owner.address);
    });

    it("Should be connected to the MindoraRunner contract", async function () {
      expect(await nftMarketplace.mindoraRunner()).to.equal(mindoraRunner.address);
    });
  });

  describe("List NFT", function () {
    beforeEach(async () => {
      // Register a player and mint an NFT
      await createPlayer({
        contract: mindoraRunner,
        player: player1,
        username: "seller",
        stage: 1,
        score: 1000,
        coins: 100,
      });
      
      // Mint an NFT to player1
      await mindoraRunner.connect(player1).claimBadge(1);
    });

    it("Should allow NFT owner to list an NFT for sale", async function () {
      // Approve the marketplace to transfer the NFT
      await mindoraRunner.connect(player1).approve(nftMarketplace.address, TOKEN_ID);
      
      // List the NFT for sale
      await expect(nftMarketplace.connect(player1).listNFT(TOKEN_ID, LISTING_PRICE))
        .to.emit(nftMarketplace, "NFTListed")
        .withArgs(TOKEN_ID, player1.address, LISTING_PRICE);
      
      // Check the listing details
      const listing = await nftMarketplace.listings(TOKEN_ID);
      expect(listing.price).to.equal(LISTING_PRICE);
      expect(listing.seller).to.equal(player1.address);
      expect(listing.isActive).to.be.true;
    });

    it("Should not allow non-owner to list an NFT", async function () {
      await expect(
        nftMarketplace.connect(player2).listNFT(TOKEN_ID, LISTING_PRICE)
      ).to.be.revertedWith("Not the token owner");
    });

    it("Should not allow listing an already listed NFT", async function () {
      // First list the NFT
      await mindoraRunner.connect(player1).approve(nftMarketplace.address, TOKEN_ID);
      await nftMarketplace.connect(player1).listNFT(TOKEN_ID, LISTING_PRICE);
      
      // Try to list it again
      await expect(
        nftMarketplace.connect(player1).listNFT(TOKEN_ID, LISTING_PRICE)
      ).to.be.revertedWith("NFT already listed");
    });
  });

  describe("Buy NFT", function () {
    beforeEach(async () => {
      // Setup: Player1 lists an NFT for sale
      await createPlayer({
        contract: mindoraRunner,
        player: player1,
        username: "seller",
        stage: 1,
        score: 1000,
        coins: 100,
      });
      await mindoraRunner.connect(player1).claimBadge(1);
      await mindoraRunner.connect(player1).approve(nftMarketplace.address, TOKEN_ID);
      await nftMarketplace.connect(player1).listNFT(TOKEN_ID, LISTING_PRICE);
    });

    it("Should allow buying a listed NFT", async function () {
      const initialBalance = await player1.getBalance();
      
      // Player2 buys the NFT
      await expect(
        nftMarketplace.connect(player2).buyNFT(TOKEN_ID, { value: LISTING_PRICE })
      ).to.emit(nftMarketplace, "NFTSold")
       .withArgs(TOKEN_ID, player1.address, player2.address, LISTING_PRICE);
      
      // Check NFT ownership transfer
      expect(await mindoraRunner.ownerOf(TOKEN_ID)).to.equal(player2.address);
      
      // Check payment to seller (minus marketplace fee)
      const finalBalance = await player1.getBalance();
      const marketplaceFee = LISTING_PRICE.mul(await nftMarketplace.marketplaceFee()).div(100);
      expect(finalBalance.sub(initialBalance)).to.equal(LISTING_PRICE.sub(marketplaceFee));
      
      // Check listing is removed
      const listing = await nftMarketplace.listings(TOKEN_ID);
      expect(listing.isActive).to.be.false;
    });

    it("Should not allow buying with insufficient funds", async function () {
      const insufficientPrice = LISTING_PRICE.div(2);
      await expect(
        nftMarketplace.connect(player2).buyNFT(TOKEN_ID, { value: insufficientPrice })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should not allow buying an unlisted NFT", async function () {
      const unlistedTokenId = 999;
      await expect(
        nftMarketplace.connect(player2).buyNFT(unlistedTokenId, { value: LISTING_PRICE })
      ).to.be.revertedWith("NFT not listed for sale");
    });
  });

  describe("Cancel Listing", function () {
    beforeEach(async () => {
      // Setup: Player1 lists an NFT for sale
      await createPlayer({
        contract: mindoraRunner,
        player: player1,
        username: "seller",
        stage: 1,
        score: 1000,
        coins: 100,
      });
      await mindoraRunner.connect(player1).claimBadge(1);
      await mindoraRunner.connect(player1).approve(nftMarketplace.address, TOKEN_ID);
      await nftMarketplace.connect(player1).listNFT(TOKEN_ID, LISTING_PRICE);
    });

    it("Should allow seller to cancel a listing", async function () {
      await expect(nftMarketplace.connect(player1).cancelListing(TOKEN_ID))
        .to.emit(nftMarketplace, "NFTCancelled")
        .withArgs(TOKEN_ID, player1.address);
      
      // Check listing is removed
      const listing = await nftMarketplace.listings(TOKEN_ID);
      expect(listing.isActive).to.be.false;
    });

    it("Should not allow non-seller to cancel a listing", async function () {
      await expect(
        nftMarketplace.connect(player2).cancelListing(TOKEN_ID)
      ).to.be.revertedWith("Not the seller");
    });
  });

  describe("Royalties", function () {
    it("Should pay royalties to the original creator on secondary sales", async function () {
      // Setup: Player1 is the original creator
      await createPlayer({
        contract: mindoraRunner,
        player: player1,
        username: "creator",
        stage: 1,
        score: 1000,
        coins: 100,
      });
      await mindoraRunner.connect(player1).claimBadge(1);
      
      // Player1 lists the NFT
      await mindoraRunner.connect(player1).approve(nftMarketplace.address, TOKEN_ID);
      await nftMarketplace.connect(player1).listNFT(TOKEN_ID, LISTING_PRICE);
      
      // Player2 buys the NFT (primary sale - no royalties)
      await nftMarketplace.connect(player2).buyNFT(TOKEN_ID, { value: LISTING_PRICE });
      
      // Player2 lists the NFT for sale
      await mindoraRunner.connect(player2).approve(nftMarketplace.address, TOKEN_ID);
      await nftMarketplace.connect(player2).listNFT(TOKEN_ID, LISTING_PRICE);
      
      // Get initial balances
      const creatorInitialBalance = await player1.getBalance();
      const sellerInitialBalance = await player2.getBalance();
      
      // Player3 buys from Player2 (secondary sale - royalties should be paid)
      await nftMarketplace.connect(addrs[0]).buyNFT(TOKEN_ID, { 
        value: LISTING_PRICE 
      });
      
      // Calculate expected amounts
      const marketplaceFee = LISTING_PRICE.mul(await nftMarketplace.marketplaceFee()).div(100);
      const royaltyAmount = LISTING_PRICE.mul(ROYALTY_PERCENTAGE).div(100);
      const sellerAmount = LISTING_PRICE.sub(marketplaceFee).sub(royaltyAmount);
      
      // Check balances
      const creatorFinalBalance = await player1.getBalance();
      const sellerFinalBalance = await player2.getBalance();
      
      // Creator should receive royalty
      expect(creatorFinalBalance.sub(creatorInitialBalance)).to.equal(royaltyAmount);
      
      // Seller should receive sale amount minus fees and royalties
      expect(sellerFinalBalance.sub(sellerInitialBalance)).to.equal(sellerAmount);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update marketplace fee", async function () {
      const newFee = 2; // 2%
      await nftMarketplace.updateMarketplaceFee(newFee);
      expect(await nftMarketplace.marketplaceFee()).to.equal(newFee);
    });

    it("Should not allow non-owner to update marketplace fee", async function () {
      await expect(
        nftMarketplace.connect(player1).updateMarketplaceFee(2)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to withdraw collected fees", async function () {
      // Send some ETH to the contract as fees
      const feeAmount = ethers.utils.parseEther("1.0");
      await owner.sendTransaction({
        to: nftMarketplace.address,
        value: feeAmount
      });
      
      const initialBalance = await owner.getBalance();
      const tx = await nftMarketplace.withdrawFees();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      
      const finalBalance = await owner.getBalance();
      expect(finalBalance.sub(initialBalance).add(gasUsed)).to.equal(feeAmount);
    });
  });
});
