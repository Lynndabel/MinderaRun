import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { 
  increaseTime, 
  createPlayer, 
  expectPlayerStats 
} from "../helpers/helpers";

describe("MindoraRunnerFinal", function () {
  let MindoraRunner: any;
  let mindoraRunner: any;
  let owner: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  // Constants
  const REGISTRATION_BONUS = 100;
  const STAGE_REWARD = 1000; // Example stage reward
  const STAGE_1_SCORE = 1500;
  const STAGE_1_COINS = 50;

  beforeEach(async function () {
    // Get signers
    [owner, player1, player2, ...addrs] = await ethers.getSigners();

    // Deploy the contract
    const MindoraRunnerFactory = await ethers.getContractFactory("MindoraRunnerFinal");
    mindoraRunner = await MindoraRunnerFactory.deploy();
    await mindoraRunner.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await mindoraRunner.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero players", async function () {
      expect(await mindoraRunner.totalPlayers()).to.equal(0);
    });
  });

  describe("Player Registration", function () {
    it("Should register a new player", async function () {
      const username = "testPlayer";
      await mindoraRunner.connect(player1).registerPlayer(username);
      
      const player = await mindoraRunner.players(player1.address);
      expect(player.username).to.equal(username);
      expect(player.isRegistered).to.be.true;
      expect(await mindoraRunner.totalPlayers()).to.equal(1);
    });

    it("Should not allow duplicate registration", async function () {
      await mindoraRunner.connect(player1).registerPlayer("testPlayer");
      await expect(
        mindoraRunner.connect(player1).registerPlayer("anotherName")
      ).to.be.revertedWith("Player already registered");
    });

    it("Should not allow empty username", async function () {
      await expect(
        mindoraRunner.connect(player1).registerPlayer("")
      ).to.be.revertedWith("Username cannot be empty");
    });
  });

  describe("Stage Completion", function () {
    beforeEach(async () => {
      // Register a player before each test
      await mindoraRunner.connect(player1).registerPlayer("testPlayer");
    });

    it("Should complete a stage and update player stats", async function () {
      const stage = 1;
      const score = STAGE_1_SCORE;
      const coins = STAGE_1_COINS;
      
      await mindoraRunner
        .connect(player1)
        .completeStage(stage, score, coins, 0, "0x");

      // Check player stats
      await expectPlayerStats(mindoraRunner, player1.address, {
        currentStage: stage,
        totalScore: score,
        inGameCoins: coins + REGISTRATION_BONUS, // Includes registration bonus
        totalGamesPlayed: 1,
      });

      // Check stage completion
      expect(await mindoraRunner.stageCompleted(player1.address, stage)).to.be.true;
    });

    it("Should not allow stage completion for unregistered players", async function () {
      await expect(
        mindoraRunner
          .connect(player2)
          .completeStage(1, 1000, 50, 0, "0x")
      ).to.be.revertedWith("Player not registered");
    });
  });

  describe("Token Claims", function () {
    beforeEach(async () => {
      // Register and complete a stage
      await createPlayer({
        contract: mindoraRunner,
        player: player1,
        username: "testPlayer",
        stage: 1,
        score: STAGE_1_SCORE,
        coins: STAGE_1_COINS,
      });
    });

    it("Should allow claiming tokens for completed stage", async function () {
      const stage = 1;
      const tokensToClaim = 100;
      
      // Initial state
      expect(await mindoraRunner.tokensClaimed(player1.address, stage)).to.be.false;
      
      // Claim tokens
      await mindoraRunner.connect(player1).claimTokens(stage, tokensToClaim);
      
      // Check state after claim
      expect(await mindoraRunner.tokensClaimed(player1.address, stage)).to.be.true;
      
      // Check player's token balance is updated
      const player = await mindoraRunner.players(player1.address);
      expect(player.questTokensEarned).to.equal(tokensToClaim);
    });

    it("Should not allow claiming tokens for uncompleted stage", async function () {
      // Stage 2 not completed yet
      await expect(
        mindoraRunner.connect(player1).claimTokens(2, 100)
      ).to.be.revertedWith("Stage not completed");
    });

    it("Should not allow double claiming of tokens", async function () {
      const stage = 1;
      await mindoraRunner.connect(player1).claimTokens(stage, 100);
      
      await expect(
        mindoraRunner.connect(player1).claimTokens(stage, 100)
      ).to.be.revertedWith("Tokens already claimed for this stage");
    });
  });

  describe("NFT Badge Claims", function () {
    beforeEach(async () => {
      // Register and complete a stage
      await createPlayer({
        contract: mindoraRunner,
        player: player1,
        username: "testPlayer",
        stage: 1,
        score: STAGE_1_SCORE,
        coins: STAGE_1_COINS,
      });
    });

    it("Should allow claiming NFT badge for completed stage", async function () {
      const stage = 1;
      
      // Claim NFT badge
      await expect(mindoraRunner.connect(player1).claimBadge(stage))
        .to.emit(mindoraRunner, "BadgeClaimed")
        .withArgs(player1.address, stage);
      
      // Check state after claim
      expect(await mindoraRunner.nftClaimed(player1.address, stage)).to.be.true;
    });

    it("Should not allow claiming NFT for uncompleted stage", async function () {
      // Stage 2 not completed yet
      await expect(
        mindoraRunner.connect(player1).claimBadge(2)
      ).to.be.revertedWith("Stage not completed");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update registration bonus", async function () {
      const newBonus = 200;
      await mindoraRunner.updateRegistrationBonus(newBonus);
      
      // Register a new player to verify the new bonus
      await mindoraRunner.connect(player1).registerPlayer("testPlayer");
      const player = await mindoraRunner.players(player1.address);
      
      expect(player.inGameCoins).to.equal(newBonus);
    });

    it("Should not allow non-owner to update registration bonus", async function () {
      await expect(
        mindoraRunner.connect(player1).updateRegistrationBonus(200)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
