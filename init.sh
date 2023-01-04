#!/bin/bash

cd smart-contracts/ 
yarn

clear
echo "Looking for .env ..."
sleep 4

[[ -f .env ]] || ./envconfig.sh

sleep 2
clear 

echo "Initializing!"
cd ..
cat ./LICENSE.md
cd smart-contracts
yarn compile
yarn test
