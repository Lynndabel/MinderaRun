import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";

// Helper function to increase time in Hardhat Network
export const increaseTime = async (seconds: number) => {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
};

// Helper function to get the current block timestamp
export const getCurrentTimestamp = async (): Promise<number> => {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
};

// Helper function to mine a specific number of blocks
export const mineBlocks = async (count: number) => {
  for (let i = 0; i < count; i++) {
    await ethers.provider.send("evm_mine", []);
  }
};

// Helper function to create a new player
interface PlayerParams {
  contract: any;
  player: SignerWithAddress;
  username?: string;
  stage?: number;
  score?: number;
  coins?: number;
  completeStage?: boolean;
}

export const createPlayer = async ({
  contract,
  player,
  username = "testPlayer",
  stage = 1,
  score = 1000,
  coins = 100,
  completeStage = true,
}: PlayerParams) => {
  // Register player
  await contract.connect(player).registerPlayer(username);
  
  if (completeStage) {
    // Complete a stage
    await contract
      .connect(player)
      .completeStage(stage, score, coins, 0, "0x");
  }
  
  return {
    address: player.address,
    username,
    stage,
    score,
    coins,
  };
};

// Helper function to check player stats
export const expectPlayerStats = async (
  contract: any,
  playerAddress: string,
  expected: {
    username?: string;
    isRegistered?: boolean;
    currentStage?: number;
    totalScore?: number;
    inGameCoins?: number;
    questTokensEarned?: number;
    totalGamesPlayed?: number;
  }
) => {
  const player = await contract.players(playerAddress);
  
  if (expected.username !== undefined) {
    expect(player.username).to.equal(expected.username);
  }
  if (expected.isRegistered !== undefined) {
    expect(player.isRegistered).to.equal(expected.isRegistered);
  }
  if (expected.currentStage !== undefined) {
    expect(player.currentStage).to.equal(expected.currentStage);
  }
  if (expected.totalScore !== undefined) {
    expect(player.totalScore).to.equal(expected.totalScore);
  }
  if (expected.inGameCoins !== undefined) {
    expect(player.inGameCoins).to.equal(expected.inGameCoins);
  }
  if (expected.questTokensEarned !== undefined) {
    expect(player.questTokensEarned).to.equal(expected.questTokensEarned);
  }
  if (expected.totalGamesPlayed !== undefined) {
    expect(player.totalGamesPlayed).to.equal(expected.totalGamesPlayed);
  }
};
