const CoinFlip = artifacts.require("CoinFlip");

contract("CoinFlip", async function() {

    it("should flip 20 times with multiple results", async function() {
        let instance = await CoinFlip.deployed();

        let wins = 0;
        let losses = 0;
        for(let i = 1; i <= 20; i++) {
            await instance.flip();
            let winner = await instance.isWinner();

            if( winner == true ) {
                wins++;
            }
            else {
                losses++;
            }
        }
        
        console.log("Wins: " + wins + "! Losses: " + losses + "!");
        assert(wins > 0 && losses > 0, "Cannot have zero losses or zero wins!");
    });
});