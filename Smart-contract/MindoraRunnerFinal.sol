// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MindoraRunnerFinal {

    // ============ BASIC STATE ============

    address public owner;
    uint256 public totalPlayers;
    uint256 public totalGamesPlayed;

    // Game settings
    uint256 public constant REGISTRATION_BONUS = 100;
    uint256 public constant COMPLETION_MULTIPLIER = 2;

    // ============ SIMPLE STRUCTS ============

    struct Player {
        string username;
        bool isRegistered;
        uint256 currentStage;
        uint256 totalScore;
        uint256 inGameCoins;           // Only coins for in-game purchases
        uint256 questTokensEarned;     // Track tokens earned (frontend mints real ones)
        uint256 totalGamesPlayed;
        uint256 registrationTime;
    }

    struct GameSession {
        address player;
        uint256 stage;
        uint256 score;
        uint256 coinsCollected;
        bool stageCompleted;
        uint256 timestamp;
    }

    // ============ STORAGE ============

    mapping(address => Player) public players;
    mapping(uint256 => GameSession[]) public stageLeaderboards;  // stage => sessions
    mapping(address => mapping(uint256 => bool)) public stageCompleted;
<<<<<<< HEAD
=======
    mapping(address => mapping(uint256 => bool)) public tokensClaimed;  // Track if player claimed HTS tokens for stage
    mapping(address => mapping(uint256 => bool)) public nftClaimed;     // Track if player claimed NFT badge for stage
>>>>>>> 335fef4c996f6001c0ea4bc9fb9f487eeda53ed8

    // ============ EVENTS ============

    event PlayerRegistered(address indexed player, string username);
    event GameSessionSaved(address indexed player, uint256 stage, uint256 score, uint256 coinsCollected, bool completed);
    event StageCompleted(address indexed player, uint256 stage, uint256 questTokensEarned);
    event ItemPurchased(address indexed player, string itemType, uint256 cost);
<<<<<<< HEAD
=======
    event TokensClaimed(address indexed player, uint256 stage, uint256 tokenAmount);
    event NFTClaimed(address indexed player, uint256 stage, string badgeName);
>>>>>>> 335fef4c996f6001c0ea4bc9fb9f487eeda53ed8

    // ============ BASIC MODIFIERS ============

    modifier onlyRegistered() {
        require(players[msg.sender].isRegistered, "Not registered");
        _;
    }

    // ============ CORE FUNCTIONS ============

    constructor() {
        owner = msg.sender;
    }

    function registerPlayer(string memory _username) external {
        require(!players[msg.sender].isRegistered, "Already registered");
        require(bytes(_username).length > 0 && bytes(_username).length <= 20, "Invalid username");

        players[msg.sender] = Player({
            username: _username,
            isRegistered: true,
            currentStage: 1,
            totalScore: 0,
            inGameCoins: REGISTRATION_BONUS,  // Start with 100 coins
            questTokensEarned: 0,
            totalGamesPlayed: 0,
            registrationTime: block.timestamp
        });

        totalPlayers++;
        emit PlayerRegistered(msg.sender, _username);
    }

    function saveGameSession(
        uint256 _stage,
        uint256 _finalScore,
        uint256 _coinsCollected,
        uint256 _questionsCorrect,
        bool _stageCompleted
    ) external onlyRegistered {

        Player storage player = players[msg.sender];
<<<<<<< HEAD
        require(_stage <= player.currentStage, "Stage locked");
=======
        
        // Allow saving if:
        // 1. Stage is <= currentStage (normal sequential progression), OR
        // 2. Stage is currentStage + 1 AND this is a completion (allows catching up if player completed locally)
        // This handles cases where player completed stages locally but contract hasn't updated yet
        require(
            _stage <= player.currentStage || 
            (_stage == player.currentStage + 1 && _stageCompleted && stageCompleted[msg.sender][_stage - 1]),
            "Stage locked"
        );
>>>>>>> 335fef4c996f6001c0ea4bc9fb9f487eeda53ed8

        // Always save coins and update stats
        player.inGameCoins += _coinsCollected;
        player.totalScore += _finalScore;
        player.totalGamesPlayed++;

        // Add to leaderboard
        stageLeaderboards[_stage].push(GameSession({
            player: msg.sender,
            stage: _stage,
            score: _finalScore,
            coinsCollected: _coinsCollected,
            stageCompleted: _stageCompleted,
            timestamp: block.timestamp
        }));

        // Stage completion bonuses
        if (_stageCompleted && !stageCompleted[msg.sender][_stage]) {
            require(_questionsCorrect > 0, "Must answer questions");

            // Mark completed
            stageCompleted[msg.sender][_stage] = true;

            // Double coins bonus
            player.inGameCoins += _coinsCollected * COMPLETION_MULTIPLIER;

            // Track tokens earned (frontend will mint real tokens)
            uint256 tokensToEarn = _getStageTokenReward(_stage);
            player.questTokensEarned += tokensToEarn;

<<<<<<< HEAD
            // Unlock next stage
            if (_stage == player.currentStage && _stage < 3) {
                player.currentStage++;
=======
            // Unlock next stage when completing any stage that matches or exceeds current stage
            // This allows:
            // - Sequential progression: complete stage 1 → unlock 2, complete stage 2 → unlock 3
            // - Catching up: if player completed stage 2 locally (currentStage=1), save stage 2 → unlock 3
            if (_stage >= player.currentStage && _stage < 3) {
                // Set currentStage to completed stage + 1 to unlock next stage
                player.currentStage = _stage + 1;
>>>>>>> 335fef4c996f6001c0ea4bc9fb9f487eeda53ed8
            }

            emit StageCompleted(msg.sender, _stage, tokensToEarn);
        }
<<<<<<< HEAD

        totalGamesPlayed++;
=======
>>>>>>> 335fef4c996f6001c0ea4bc9fb9f487eeda53ed8
        emit GameSessionSaved(msg.sender, _stage, _finalScore, _coinsCollected, _stageCompleted);
    }

    function purchaseItem(string memory _itemType, uint256 _cost) external onlyRegistered {
        Player storage player = players[msg.sender];
        require(player.inGameCoins >= _cost, "Insufficient coins");

        player.inGameCoins -= _cost;

        emit ItemPurchased(msg.sender, _itemType, _cost);
        // Item logic handled in frontend
    }

    // ============ VIEW FUNCTIONS ============

    function getPlayer(address _player) external view returns (Player memory) {
        return players[_player];
    }

    function getStageLeaderboard(uint256 _stage, uint256 _limit)
        external view returns (GameSession[] memory) {
        uint256 length = stageLeaderboards[_stage].length;
        uint256 returnLength = length > _limit ? _limit : length;

        GameSession[] memory result = new GameSession[](returnLength);

        // Return most recent entries (simple approach)
        uint256 startIndex = length > returnLength ? length - returnLength : 0;
        for (uint256 i = 0; i < returnLength; i++) {
            result[i] = stageLeaderboards[_stage][startIndex + i];
        }

        return result;
    }

    function isStageCompleted(address _player, uint256 _stage) external view returns (bool) {
        return stageCompleted[_player][_stage];
    }

<<<<<<< HEAD
=======
    function areTokensClaimed(address _player, uint256 _stage) external view returns (bool) {
        return tokensClaimed[_player][_stage];
    }

    function isNFTClaimed(address _player, uint256 _stage) external view returns (bool) {
        return nftClaimed[_player][_stage];
    }

    function claimTokens(uint256 _stage) external onlyRegistered {
        require(stageCompleted[msg.sender][_stage], "Stage not completed");
        require(!tokensClaimed[msg.sender][_stage], "Tokens already claimed");

        // Mark tokens as claimed
        tokensClaimed[msg.sender][_stage] = true;

        uint256 tokenAmount = _getStageTokenReward(_stage);
        emit TokensClaimed(msg.sender, _stage, tokenAmount);
    }

    function claimNFT(uint256 _stage) external onlyRegistered {
        require(stageCompleted[msg.sender][_stage], "Stage not completed");
        require(!nftClaimed[msg.sender][_stage], "NFT already claimed");

        // Mark NFT as claimed
        nftClaimed[msg.sender][_stage] = true;

        string memory badgeName = _getStageBadgeName(_stage);
        emit NFTClaimed(msg.sender, _stage, badgeName);
    }

    function getGeneralLeaderboard(uint256 _limit) external view returns (GameSession[] memory) {
        // Collect all game sessions from all stages
        uint256 totalSessions = 0;
        for (uint256 stage = 1; stage <= 3; stage++) {
            totalSessions += stageLeaderboards[stage].length;
        }

        // Create array to hold all sessions
        GameSession[] memory allSessions = new GameSession[](totalSessions);
        uint256 index = 0;

        // Combine all sessions from all stages
        for (uint256 stage = 1; stage <= 3; stage++) {
            for (uint256 i = 0; i < stageLeaderboards[stage].length; i++) {
                allSessions[index] = stageLeaderboards[stage][i];
                index++;
            }
        }

        // Simple bubble sort to get top scores (not gas efficient for large datasets, but works for demo)
        for (uint256 i = 0; i < allSessions.length && i < _limit * 2; i++) {
            for (uint256 j = i + 1; j < allSessions.length; j++) {
                if (allSessions[j].score > allSessions[i].score) {
                    GameSession memory temp = allSessions[i];
                    allSessions[i] = allSessions[j];
                    allSessions[j] = temp;
                }
            }
        }

        // Return only the top _limit entries
        uint256 returnLength = allSessions.length > _limit ? _limit : allSessions.length;
        GameSession[] memory result = new GameSession[](returnLength);
        for (uint256 i = 0; i < returnLength; i++) {
            result[i] = allSessions[i];
        }

        return result;
    }

>>>>>>> 335fef4c996f6001c0ea4bc9fb9f487eeda53ed8
    function getGameStats() external view returns (uint256, uint256) {
        return (totalPlayers, totalGamesPlayed);
    }

    // ============ HELPER FUNCTIONS ============

    function _getStageTokenReward(uint256 _stage) internal pure returns (uint256) {
        if (_stage == 1) return 20;
        if (_stage == 2) return 50;
        if (_stage == 3) return 100;
        return 0;
    }
<<<<<<< HEAD
=======

    function _getStageBadgeName(uint256 _stage) internal pure returns (string memory) {
        if (_stage == 1) return "Explorer Badge";
        if (_stage == 2) return "Adventurer Badge";
        if (_stage == 3) return "Master Badge";
        return "Unknown Badge";
    }
>>>>>>> 335fef4c996f6001c0ea4bc9fb9f487eeda53ed8
}