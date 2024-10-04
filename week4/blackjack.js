// blackjack.js
let cardOne = 7;
let cardTwo = 5;
let cardThree = 9;
let sum = cardOne + cardTwo;
let cardOneBank = 7;
let cardTwoBank = 5;
let cardThreeBank = 6;
let cardFourBank = 4;
sum += cardThree;
if (sum > 21) {
 console.log('You lost');
} 

let bankCard = [cardOneBank, cardTwoBank, cardThreeBank, cardFourBank];
let bankCardNum =0
let bankSum = 0;

while (bankSum <= 17){
    bankSum += bankCard[bankCardNum];
    bankCardNum++;
}

console.log(`You have ${sum} points`);
console.log(`Bank have ${bankSum} points`);

if (bankSum > 21 || (sum <= 21 && sum > bankSum)) {
    console.log('You win');
   } else if(bankSum === sum){
    console.log('Draw')
   }    
   else {
    console.log('Bank wins');
   }