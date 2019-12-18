For convenience, there should be two separate terminals running:
1. Being in root after installing ganache-cli, run the command: ganache-cli
This generates a set of 10 accounts with 100 ethers in them. We'll be using these while testing the dapp.
2. Being in the folder where entire truffle project files are present (election-truffle-ganache-with-token), run the following commands to compile, deploy the contract and start the dapp:

npm i  (to install node libraries and dependencies as per package.json)

truffle compile  (compiles solidity contracts present in contracts folder and puts compiled codes in build)

truffle migrate (deploys the compiled contracts to loacl network, which we're running on ganache)

(Before starting lite-server, replace the 'owner' and 'voter' with two of the addresses from ganache in src/app.js file)
npm run dev  (starts the lite-server to host our web-page)


*(To create a project from scratch use command 'truffle init' in an empty folder)


