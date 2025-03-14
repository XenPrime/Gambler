let balance = 1000;
const balanceDisplay = document.getElementById('balance');
const betInput = document.getElementById('bet-amount');
const redButton = document.getElementById('red-btn');
const blackButton = document.getElementById('black-btn');
const resultDisplay = document.getElementById('result');

function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = `Balance: ${balance} coins`;
}

function placeBet(color) {
    const betAmount = parseInt(betInput.value);
    
    if (isNaN(betAmount) || betAmount <= 0) {
        resultDisplay.textContent = 'Please enter a valid bet amount!';
        return;
    }
    
    if (betAmount > balance) {
        resultDisplay.textContent = 'Not enough coins!';
        return;
    }
    
    const randomNumber = Math.random();
    const result = randomNumber < 0.5 ? 'red' : 'black';
    
    if (result === color) {
        updateBalance(betAmount);
        resultDisplay.textContent = `You won ${betAmount} coins!`;
        resultDisplay.style.color = '#4CAF50';
    } else {
        updateBalance(-betAmount);
        resultDisplay.textContent = `You lost ${betAmount} coins!`;
        resultDisplay.style.color = '#ff4444';
    }
}

redButton.addEventListener('click', () => placeBet('red'));
blackButton.addEventListener('click', () => placeBet('black'));

// Reset result text color when entering new bet
betInput.addEventListener('input', () => {
    resultDisplay.style.color = 'white';
    resultDisplay.textContent = '';
});