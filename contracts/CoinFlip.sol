import "./Ownable.sol";

pragma solidity 0.5.12;

contract CoinFlip is Ownable {

	enum CoinSymbol { Heads, Tails }

	address private owner;
	uint private balance;

	modifier costs(uint cost) {
		require(msg.value >= cost);
		_;
	}

	event flippedCoin(address player, bool winner);

	constructor() public {
		owner = msg.sender;
	}

	function flip(CoinSymbol coinSymbol) public payable costs(0.1 ether) returns (bool) {
		require(msg.value * 2 <= balance, "Contract does not have enough funds to cover bet!");

		balance += msg.value;
		uint prizeAmount = msg.value * 2;

		CoinSymbol winner = CoinSymbol(uint(now % 2));
		if(winner == coinSymbol) {
			balance -= prizeAmount;
			msg.sender.transfer(prizeAmount);
			assert(balance >= 0);
			emit flippedCoin(msg.sender, true);
			return true;
		}

		emit flippedCoin(msg.sender, false);
		return false;
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
}
