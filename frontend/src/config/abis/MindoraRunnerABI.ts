export const MindoraRunnerABI = 
	[
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_stage",
					"type": "uint256"
				}
			],
			"name": "claimNFT",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_stage",
					"type": "uint256"
				}
			],
			"name": "claimTokens",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "player",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "stage",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "score",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "coinsCollected",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "bool",
					"name": "completed",
					"type": "bool"
				}
			],
			"name": "GameSessionSaved",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "player",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "string",
					"name": "itemType",
					"type": "string"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "cost",
					"type": "uint256"
				}
			],
			"name": "ItemPurchased",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "player",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "stage",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "string",
					"name": "badgeName",
					"type": "string"
				}
			],
			"name": "NFTClaimed",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "player",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "string",
					"name": "username",
					"type": "string"
				}
			],
			"name": "PlayerRegistered",
			"type": "event"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "_itemType",
					"type": "string"
				},
				{
					"internalType": "uint256",
					"name": "_cost",
					"type": "uint256"
				}
			],
			"name": "purchaseItem",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "_username",
					"type": "string"
				}
			],
			"name": "registerPlayer",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_stage",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "_finalScore",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "_coinsCollected",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "_questionsCorrect",
					"type": "uint256"
				},
				{
					"internalType": "bool",
					"name": "_stageCompleted",
					"type": "bool"
				}
			],
			"name": "saveGameSession",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "player",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "stage",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "questTokensEarned",
					"type": "uint256"
				}
			],
			"name": "StageCompleted",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "player",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "stage",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "tokenAmount",
					"type": "uint256"
				}
			],
			"name": "TokensClaimed",
			"type": "event"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "_player",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "_stage",
					"type": "uint256"
				}
			],
			"name": "areTokensClaimed",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "COMPLETION_MULTIPLIER",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getGameStats",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_limit",
					"type": "uint256"
				}
			],
			"name": "getGeneralLeaderboard",
			"outputs": [
				{
					"components": [
						{
							"internalType": "address",
							"name": "player",
							"type": "address"
						},
						{
							"internalType": "uint256",
							"name": "stage",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "score",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "coinsCollected",
							"type": "uint256"
						},
						{
							"internalType": "bool",
							"name": "stageCompleted",
							"type": "bool"
						},
						{
							"internalType": "uint256",
							"name": "timestamp",
							"type": "uint256"
						}
					],
					"internalType": "struct MindoraRunnerFinal.GameSession[]",
					"name": "",
					"type": "tuple[]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "_player",
					"type": "address"
				}
			],
			"name": "getPlayer",
			"outputs": [
				{
					"components": [
						{
							"internalType": "string",
							"name": "username",
							"type": "string"
						},
						{
							"internalType": "bool",
							"name": "isRegistered",
							"type": "bool"
						},
						{
							"internalType": "uint256",
							"name": "currentStage",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "totalScore",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "inGameCoins",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "questTokensEarned",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "totalGamesPlayed",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "registrationTime",
							"type": "uint256"
						}
					],
					"internalType": "struct MindoraRunnerFinal.Player",
					"name": "",
					"type": "tuple"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_stage",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "_limit",
					"type": "uint256"
				}
			],
			"name": "getStageLeaderboard",
			"outputs": [
				{
					"components": [
						{
							"internalType": "address",
							"name": "player",
							"type": "address"
						},
						{
							"internalType": "uint256",
							"name": "stage",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "score",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "coinsCollected",
							"type": "uint256"
						},
						{
							"internalType": "bool",
							"name": "stageCompleted",
							"type": "bool"
						},
						{
							"internalType": "uint256",
							"name": "timestamp",
							"type": "uint256"
						}
					],
					"internalType": "struct MindoraRunnerFinal.GameSession[]",
					"name": "",
					"type": "tuple[]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "_player",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "_stage",
					"type": "uint256"
				}
			],
			"name": "isNFTClaimed",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "_player",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "_stage",
					"type": "uint256"
				}
			],
			"name": "isStageCompleted",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "nftClaimed",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "owner",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "players",
			"outputs": [
				{
					"internalType": "string",
					"name": "username",
					"type": "string"
				},
				{
					"internalType": "bool",
					"name": "isRegistered",
					"type": "bool"
				},
				{
					"internalType": "uint256",
					"name": "currentStage",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "totalScore",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "inGameCoins",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "questTokensEarned",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "totalGamesPlayed",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "registrationTime",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "REGISTRATION_BONUS",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "stageCompleted",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "stageLeaderboards",
			"outputs": [
				{
					"internalType": "address",
					"name": "player",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "stage",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "score",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "coinsCollected",
					"type": "uint256"
				},
				{
					"internalType": "bool",
					"name": "stageCompleted",
					"type": "bool"
				},
				{
					"internalType": "uint256",
					"name": "timestamp",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "tokensClaimed",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "totalGamesPlayed",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "totalPlayers",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		}
	] as const;