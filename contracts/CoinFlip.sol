import "./Ownable.sol";
import "./provableAPI_0.5.sol";

pragma solidity 0.5.12;

contract CoinFlip is Ownable, usingProvable {

	// Declarations
	struct Bet {

		address player;
		uint prizeAmount;
		CoinSymbol symbol;

    }

	enum CoinSymbol { Heads, Tails }

	// Oracle configuration parameters
	uint256 constant QUERY_EXECUTION_DELAY = 0;
	uint256 constant GAS_FOR_CALLBACK = 200000;
	uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;

	// Contract attributes
	uint private balance;
	mapping(bytes32 => Bet) private waitingResponses;
	mapping(address => uint) private rewards;

	// Modifiers
	modifier costs(uint cost) {
		require(msg.value >= cost);
		_;
	}

	// Events
	event flippedCoin(address player, bool winner);
	event claimedReward(address player, uint reward);

	// Methods
	function flip(CoinSymbol coinSymbol) public payable costs(0.1 ether) returns (bool) {
		require(msg.value * 2 <= balance, "Contract does not have enough funds to cover bet!");

		balance += msg.value;
		uint prizeAmount = msg.value * 2;

		// request random number from the oracle
        bytes32 id = provable_newRandomDSQuery(QUERY_EXECUTION_DELAY, NUM_RANDOM_BYTES_REQUESTED,
											GAS_FOR_CALLBACK);

		
		waitingResponses[id] = createBet(msg.sender, prizeAmount, coinSymbol);

	}

	function createBet(address player, uint prizeAmount, CoinSymbol symbol) private pure returns(Bet memory) {

		Bet memory bet;
		bet.player = player;
		bet.prizeAmount = prizeAmount;
		bet.symbol = symbol;
		return bet;

	}

	function __callback(bytes32 _queryId, string memory _result, bytes memory _proof) public {
        require(msg.sender == provable_cbAddress());

		// process result from oracle to get a binary value of the winner coin symbol
        CoinSymbol winner = CoinSymbol(uint256(keccak256(abi.encodePacked(_result))) % 2);

		Bet memory bet = waitingResponses[_queryId];

		if(winner == bet.symbol) {
			balance -= bet.prizeAmount;
			rewards[bet.player] = bet.prizeAmount;
			delete waitingResponses[_queryId];
			assert(balance >= 0);

			// player won
			emit flippedCoin(msg.sender, true);
		}

		// player lost
		emit flippedCoin(msg.sender, false);
    }

	function claimReward() public returns(uint) {
		require(rewards[msg.sender] > 0);

		uint reward = rewards[msg.sender];
		delete rewards[msg.sender];
		msg.sender.transfer(reward);
        assert(reward == 0);

		emit claimedReward(msg.sender, reward);
		return reward;
	}

	function addFunds() public payable {
		require(msg.value > 0, "Add funds need to be higher than zero!");
		balance += msg.value;
	}

	function withdrawalFunds() public onlyOwner returns(uint) {
		uint toTransfer = balance;
		balance = 0;
		msg.sender.transfer(toTransfer);
        assert(balance == 0);

		return toTransfer;
	}

	function getBalance() public view returns(uint) {
		return balance;
	}

	function getReward() public view returns(uint) {
		return rewards[msg.sender];
	}
}
