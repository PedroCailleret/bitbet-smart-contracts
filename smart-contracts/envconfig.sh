#!/bin/bash
echo ".env file not found."
echo "You will be prompted to fill in your .env variables.
Press 'y' to continue"
count=0
while : ; do
read -n 1 k <&1
if [[ $k = y ]] ; then
printf "\nProceeding with .env config\n"
break
else
((count=$count+1))
echo "Press 'y' to continue"
fi
done

filename=".env.example"
wellset=".env"

search1="INSERT_ALCHEMY_API_KEY"
search2="INSERT_MNEMONIC"
search3="INSERT_ETHERSCAN_API_KEY"

read -p "INSERT ALCHEMY API KEY: " replace1
read -p "INSERT 12 WORD MNEMONIC: " replace2
read -p "INSERT ETHERSCAN API KEY: " replace3

sed -i "s/"$search1"/$replace1/g;s/"$search2"/$replace2/g;s/"$search3"/$replace3/g;" $filename

mv $filename $wellset
echo ".env file created"
echo "Initializing tests..."

sleep 5
