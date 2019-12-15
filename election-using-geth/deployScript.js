const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const fs = require('fs');
const Common = require ('ethereumjs-common').default;
const jsonFile = 'build/contracts/Election.json';
const EthereumTx = require('ethereumjs-tx').Transaction;

const owneraddress = '0x2d9a98fD01FC7228Defc26E8d6d8E098840C26f7'//'0x159BEb057A2ED989A09Bd2778A7d82eB7060E6dE'//
const ownerprivatekey = '2ec442b3534a65bbd17e84027f4b7b7d585fc106e65935b02c51df7750efcf8c'

const contractAddress = "0xCd4d8b6DF946bb2612aB05664e0e8E18259Fe20a";
const deploy = () => {
    try {
        fs.readFile(jsonFile, 'utf-8', async (err, data) => {
            if (err) {
                console.log('Error in reading compiled json File.')
                throw err;
            }
            const fileJsondata = JSON.parse(data);
            let abi = fileJsondata.abi;
            let bytecode = (fileJsondata.evm.bytecode.object.startsWith('0x')) ? fileJsondata.evm.bytecode.object : '0x' + fileJsondata.evm.bytecode.object;
            const myContract = new web3.eth.Contract(abi, {
                from: owneraddress, // default from address
                //gasLimit: '5000000',
                gasPrice: '0x0' // default gas price in wei, 20 gwei in this case
            });
            // const nonce = await web3.eth.getTransactionCount(owneraddress)
            let deployData = myContract.deploy({
                data: bytecode
            }).encodeABI();
            myContract.defaultCommon = { customChain: { name: 'custom-network', chainId: 11122019, networkId: 11122019 }, baseChain: 'mainnet' };
            
            const customCommon = Common.forCustomChain(
                'mainnet',
                {
                    name: 'custom-network',
                    networkId: 11122019,
                    chainId: 11122019,
                },
                'petersburg',
            )
        

            let gasPrice = 0;
            let gasPriceHex = web3.utils.toHex(gasPrice);
            let gasLimitHex = web3.utils.toHex(6721975);
            let block = web3.eth.getBlock("latest");
            let nonce = await web3.eth.getTransactionCount(owneraddress);
            let nonceHex = web3.utils.toHex(nonce);
            console.log('nonce--->', nonce)
            let rawTx = new EthereumTx(
                {
                    nonce: nonce,
                   // to: '',
                    gasPrice: gasPriceHex,
                    gasLimit: gasLimitHex,
                    data: deployData, 
                    from: owneraddress,
                },
                { common: customCommon },
            );

            // Get the account private key, need to use it to sign the transaction later.
            let privateKey = Buffer.from(ownerprivatekey, 'hex')

            let tx = rawTx;//new EthereumTx(rawTx);

            // Sign the transaction ,

            tx.sign(privateKey);
            let serializedTx = tx.serialize();

            let receipt = null;
                //console.log('singed tx--->>', serializedTx)
            // Submit the smart contract deployment transaction
            web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), (err, hash) => {
                if (err) {
                    console.log(err); return;
                }

                // Log the tx, you can explore status manually with eth.getTransaction()
                console.log('Contract creation tx: ' + hash);

                // Wait for the transaction to be mined
                while (receipt == null) {

                    receipt = web3.eth.getTransactionReceipt(hash);

                    // Simulate the sleep function
                    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
                }

                console.log('Contract address: ' + receipt.contractAddress);
            })

        })
    } catch (e) {
        console.log('Error in contract call===>', e);
    }

}

deploy();