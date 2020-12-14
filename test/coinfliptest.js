const CoinFlip = artifacts.require("CoinFlip");
const truffleAssert = require("truffle-assertions");

contract("CoinFlip", async function(accounts) {

    const heads = 0;
    const invalidSymbol = 5;
    let instance;

    before(async function() {

        instance = await CoinFlip.deployed();

    })

    it("should increase contract balance", async function() {

        let balanceBefore = await instance.getBalance();
        await instance.addFunds({value: web3.utils.toWei("10", "ether")});
        let balanceAfter = await instance.getBalance();
        assert(balanceBefore < balanceAfter, "Contract balance was not increased after add funds");

    });

    it("should not flip with invalid symbols", async function() {

        await instance.addFunds({value: web3.utils.toWei("1", "ether")});
        await truffleAssert.fails(instance.flip(invalidSymbol, {value: web3.utils.toWei("0.1", "ether")}),
                                    truffleAssert.ErrorType.INVALID_OPCODE);

    });

    it("should flip with valid symbols", async function() {

        await instance.addFunds({value: web3.utils.toWei("1", "ether")});
        await truffleAssert.passes(instance.flip(heads, {value: web3.utils.toWei("0.1", "ether")}));

    });

    it("should flip 20 times with multiple results", async function() {

        await instance.addFunds({value: web3.utils.toWei("2", "ether")});

        let wins = 0;
        let losses = 0;
        for(let i = 1; i <= 20; i++) {

            let result = await instance.flip(heads, {value: web3.utils.toWei("0.1", "ether")});
            
            if( result.receipt.logs[0].args.winner == true ) {
                wins++;
            }
            else {
                losses++;
            }

        }
        
        //console.log("Wins: " + wins + "! Losses: " + losses + "!");
        assert(wins > 0 && losses > 0, "Cannot have zero losses or zero wins!");

    });

    it("should not withdrawal funds to a non-owner contract", async function() {

        await instance.addFunds({from: accounts[2], value: web3.utils.toWei("1", "ether")});
        await truffleAssert.fails(instance.withdrawalFunds({from: accounts[2]}), truffleAssert.ErrorType.REVERT);

    });

    it("should withdrawal funds to the owner contract", async function() {

        await instance.addFunds({from: accounts[2], value: web3.utils.toWei("1", "ether")});
        await truffleAssert.passes(instance.withdrawalFunds({from: accounts[0]}));

    });

    it("owners balance should be increased after withdrawal", async function(){

        await instance.addFunds({from: accounts[2], value: web3.utils.toWei("1", "ether")});
    
        let balanceBefore = parseFloat(await web3.eth.getBalance(accounts[0]));
        await instance.withdrawalFunds();
        let balanceAfter = parseFloat(await web3.eth.getBalance(accounts[0]));
        assert(balanceBefore < balanceAfter, "Owners balance was not increased after withdrawal");
    
      });

      it("should reset balance to 0 after withdrawal", async function(){

        await instance.addFunds({from: accounts[2], value: web3.utils.toWei("1", "ether")});
    
        await instance.withdrawalFunds();
    
        let balance = await instance.getBalance();
        let floatBalance = parseFloat(balance);
    
        let realBalance = await web3.eth.getBalance(instance.address);
    
        assert(floatBalance == web3.utils.toWei("0", "ether") && floatBalance == realBalance, "Contract balance was not 0 after withdrawal or did not match")
    
      });

});