Steps to setup blockchain network on geth:
1. Create a folder in root directory and ensure 'genesis.json' and 'mineonlypending.js' files are copied to that folder. Being in the folder on terminal, enter below command-

geth --preload "mineonlypending.js" --datadir ethdata --networkid 11122019 --rpc --rpcapi "web3,eth,personal,miner,shh,txpool,debug,db,admin,net" --rpccorsdomain "*" --miner.gasprice "0" --allow-insecure-unlock init genesis.json

PRESS ENTER

geth --preload "mineonlypending.js" --datadir ethdata --networkid 11122019 --rpc --rpcapi "web3,eth,personal,miner,shh,txpool,debug,db,admin,net" --rpccorsdomain "*" --miner.gasprice "0" --allow-insecure-unlock console

PRESS ENTER and you'll enter into a console. If it's a fresh install of geth, there will be two iterations of DAG download (number goes till 100), so wait for a while.

2. Creation of miner account (coinbase account)
Then create new account using - personal.newAccount()
Remember the password given to the account

Then to get balance into the newly created account (which also becomes coinbase account- miner account where eth rewards are credited), use command- miner.start()

After seeing lines like 'Committing new block', the account created should have certain balance. Check balance using- eth.getBalance(eth.coinbase)

3. Compiling and deploying smart contract to geth-
Compile the solidity code on remix. Check the compile option (third button from top in left navigation bar). View compilation details and copy web3deploy and paste it in a file web3deploy.js in the folder created in step 1.
Deploy smart contract with given command- 
loadScript(web3deploy.js)

#If error thrown, like 'account locked', use following command to unlock account- personal.unlockAccount(eth.coinbase) [eth.coinbase is the address of coinbase account, you can alternately use the address whom you want to make the owner of contract]

4. Copy the contract address that gets printed after contract is successfully mined and paste it in app.js (present in src folder) where contract object is created in initContract()
[new web3.eth.Contract(election.abi, 'contractAddress here')]


Steps to run the project-
1. Use this command to install dependencies - npm i
2. Ensure abi is pasted in build/contracts/Election.json 
3. Use updated contract address in app.js (within src)
4. Use this to start lite-server to load the html page- npm run dev
