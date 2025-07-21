const display = document.getElementById('display');
let current = '0';
let operator = null;
let operand = null;
let justEvaluated = false;

function updateDisplay() {
  display.textContent = current;
}

function inputNumber(num) {
  if (justEvaluated) {
    current = num === '.' ? '0.' : num;
    justEvaluated = false;
  } else if (current === '0' && num !== '.') {
    current = num;
  } else if (num === '.' && current.includes('.')) {
    return;
  } else {
    current += num;
  }
  updateDisplay();
}

function setOperator(op) {
  if (operator && !justEvaluated) {
    evaluate();
  }
  operand = parseFloat(current);
  operator = op;
  justEvaluated = false;
  current = '0';
}

function evaluate() {
  if (operator && operand !== null) {
    let result;
    const curr = parseFloat(current);
    switch (operator) {
      case 'add': result = operand + curr; break;
      case 'subtract': result = operand - curr; break;
      case 'multiply': result = operand * curr; break;
      case 'divide': result = curr === 0 ? '오류' : operand / curr; break;
      default: return;
    }
    current = String(result).length > 12 ? String(result).slice(0, 12) : String(result);
    operator = null;
    operand = null;
    justEvaluated = true;
    updateDisplay();
  }
}

function clearAll() {
  current = '0';
  operator = null;
  operand = null;
  justEvaluated = false;
  updateDisplay();
}

function clearEntry() {
  current = '0';
  updateDisplay();
}

function backspace() {
  if (justEvaluated) return;
  if (current.length > 1) {
    current = current.slice(0, -1);
  } else {
    current = '0';
  }
  updateDisplay();
}

document.querySelector('.buttons').addEventListener('click', (e) => {
  if (!e.target.classList.contains('btn')) return;
  if (e.target.dataset.number !== undefined) {
    inputNumber(e.target.dataset.number);
  } else if (e.target.dataset.action) {
    switch (e.target.dataset.action) {
      case 'add': setOperator('add'); break;
      case 'subtract': setOperator('subtract'); break;
      case 'multiply': setOperator('multiply'); break;
      case 'divide': setOperator('divide'); break;
      case 'equals': evaluate(); break;
      case 'clear': clearAll(); break;
      case 'clear-entry': clearEntry(); break;
      case 'backspace': backspace(); break;
    }
  }
});

updateDisplay(); 