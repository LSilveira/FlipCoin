var web3 = new Web3(Web3.givenProvider);
var contractInstance;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts) {
        contractInstance = new web3.eth.Contract(abi, "0xCAa3667c99a067f074F51C2Ac94ab8C3F2fD3bCB", {from: accounts[0]});

        updateBalance();
    });

    $("#add_funds_button").click(addFundsButton);
    $("#withdrawal_funds_button").click(withdrawalFunds);
    $("#flip_button").click(flipCoinButton);
});

function updateBalance() {

    contractInstance.methods.getBalance().call().then(function(balance) {
        $("#balance").text((balance == null ? "0" : balance) + " ETH");
    });
    
}

function flipCoinButton() {
    var amount = $("#amount_input").val();
    var coinSide = $("#coinSide").val();

    var config = {
        value: web3.utils.toWei(amount, "ether")
    }

    contractInstance.methods.flip(coinSide).send(config)
        .on("transactionHash", function(hash) {
            console.log("Hash:" + hash);
        })
        .on("confirmation", function (confirmationNr) {
            console.log("Confirmation: " + confirmationNr);
        })
        .on("receipt", function(receipt) {
            console.log(receipt);

            let isWinner = receipt.events.flippedCoin.returnValues[1];
    
            var result;
            if(isWinner) {
                result = "Won!";
            }
            else {
                result = "Lost!";
            }
        
            $("#result").text(result);
            updateBalance();
            
        })
}

function addFundsButton() {
    var fundAmount = $("#funds_amount_input").val();

    var config = {
        value: web3.utils.toWei(fundAmount, "ether")
    }

    contractInstance.methods.addFunds().send(config)
        .on("transactionHash", function(hash) {
            console.log("Hash:" + hash);
        })
        .on("confirmation", function (confirmationNr) {
            console.log("Confirmation: " + confirmationNr);
        })
        .on("receipt", function(receipt) {
            console.log(receipt);

            updateBalance();
        })

}

function withdrawalFunds() {

    contractInstance.methods.withdrawalFunds().send()
    .on("transactionHash", function(hash) {
        console.log("Hash:" + hash);
    })
    .on("confirmation", function (confirmationNr) {
        console.log("Confirmation: " + confirmationNr);
    })
    .on("receipt", function(receipt) {
        console.log(receipt);

        updateBalance();
    })

}