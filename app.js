let startingPokerChips = 100;
let players = 3;
let noOfStarterCardes = 2;

let playerOnePoints = startingPokerChips;
let playerTwoPoints = startingPokerChips;
let playerThreePoints = startingPokerChips;

playerOnepoints -= 50;
playerTwoPoints -= 25;
playerThreePoints +=75;

let playerOneName = "Chloe";
let playerTwoName = "Jasmine";
let playerThreeName = "Jen";

console.log('Welcome! 챔피언십 타이틀은 ${playerOneName}, ${playerTwoName}, ${playerThreeName} 중 한명에게 주어집니다. 각 선수는 ${STARTING POKER CHIPS} 의 칩을 가지고 시작합니다. 흥미진진한 경기가 될 것입니다. 최고의 선수가 승리하길 바랍니다!');

let gameHasEnded = false;

gameHasEnded = ((playerOnePoints + playerTwoPOints) == 0 || ((playerTwoPoints + playerThreePoints)== 0) || ((playerOnePOints + playerThreePoints) == 0));
console.log("Game has ended: ", gameHasEnded);

