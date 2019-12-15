(If no curl present - )
sudo apt-get update && sudo apt-get -y upgrade

sudo apt-get -y install curl git vim build-essential
--------------------------------------------------------------------------
(Installing git commands-)

sudo apt update

sudo apt install git

For configuration-

git config --global user.name "Your Name" 
git config --global user.email "youremail@domain.com"

git clone https://github.com/rjhigh/skeleton
----------------------------------------------------------------------------

(Installing nvm commands- nvm is used to install nodejs, if it doesn't work, check at bottom)
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash

bash install_nvm.sh

source ~/.profile

nvm --version

nvm install v10.15
----------------------------------------------------------------------------
(Installing truffle commands-)
sudo npm install -g truffle

mkdir myproject
cd myprojet/
truffle init
truffle compile
----------------------------------------------------------------------------

(Installing ganache-cli commands-)
sudo npm i -g ganache-cl

----------------------------------------------------------------------------

(Install nodejs commands- Use this if nvm installation fails)
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -

sudo apt install nodejs

