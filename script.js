document.addEventListener("DOMContentLoaded", function() {
    const display = document.getElementById('display');
    const clear = document.getElementById('clear');
    const equals = document.getElementById('equals');
    const decimal = document.getElementById('decimal');
    const operators = {
        '+': document.getElementById('add'),
        '-': document.getElementById('subtract'),
        '*': document.getElementById('multiply'),
        '/': document.getElementById('divide')
    };
    const numbers = {
        '0': document.getElementById('zero'),
        '1': document.getElementById('one'),
        '2': document.getElementById('two'),
        '3': document.getElementById('three'),
        '4': document.getElementById('four'),
        '5': document.getElementById('five'),
        '6': document.getElementById('six'),
        '7': document.getElementById('seven'),
        '8': document.getElementById('eight'),
        '9': document.getElementById('nine')
    };

    // Initialize display to 0
    display.value = '0';
    let lastWasEqual = false;

    const isOperator = (ch) => /[+\-*/]/.test(ch);

    const sanitizeExpressionForEval = (expr) => {
        if (!/^[0-9+\-*/.]+$/.test(expr)) throw new Error('Invalid input');
        expr = expr.replace(/^[+*/]+/, '');
        expr = expr.replace(/([+\-*/])+/g, (match) => {
            if (match.length > 1) {
                if (match.endsWith('-')) {
                    const leading = match.slice(0, -1).replace(/-+/g, '');
                    const lastNonMinus = leading ? leading.slice(-1) : '';
                    return (lastNonMinus || '+') + '-';
                } else {
                    return match.slice(-1);
                }
            }
            return match;
        });
        return expr;
    };

    const formatResult = (num) => {
        if (!isFinite(num)) return 'Error';
        const rounded = Math.round(num * 1e10) / 1e10;
        let s = String(rounded);
        if (s.indexOf('.') !== -1) {
            s = s.replace(/\.?0+$/, '');
        }
        return s;
    };

    clear.addEventListener('click', () => {
        display.value = '0';
        lastWasEqual = false;
    });

    equals.addEventListener('click', () => {
        try {
            let expr = display.value;
            expr = sanitizeExpressionForEval(expr);
            if (isOperator(expr.slice(-1))) {
                expr = expr.replace(/[+\-*/]+$/, '');
            }
            const result = Function('"use strict";return (' + expr + ')')();
            display.value = result === undefined ? '0' : formatResult(result);
            lastWasEqual = true;
        } catch (error) {
            display.value = 'Error';
            lastWasEqual = true;
        }
    });

    Object.keys(numbers).forEach(num => {
        numbers[num].addEventListener('click', () => {
            if (lastWasEqual) {
                display.value = num;
                lastWasEqual = false;
                return;
            }
            const lastNumber = display.value.split(/[+\-*/]/).pop();
            if (lastNumber === '0' && num === '0') return;
            if (lastNumber === '0') {
                display.value = display.value.slice(0, -1) + num;
            } else if (display.value === '0') {
                display.value = num;
            } else {
                display.value += num;
            }
        });
    });

    Object.keys(operators).forEach(op => {
        operators[op].addEventListener('click', () => {
            if (lastWasEqual) {
                lastWasEqual = false;
            }
            const val = display.value;
            const lastChar = val.slice(-1);
            if (isOperator(lastChar)) {
                if (op === '-' && !val.endsWith('-')) {
                    display.value += '-';
                } else {
                    display.value = val.replace(/[+\-*/]+$/, op);
                }
            } else {
                display.value += op;
            }
        });
    });

    decimal.addEventListener('click', () => {
        if (lastWasEqual) {
            display.value = '0.';
            lastWasEqual = false;
            return;
        }
        const lastNumber = display.value.split(/[+\-*/]/).pop();
        if (!lastNumber.includes('.')) {
            if (lastNumber === '' || /[+\-*/]$/.test(display.value)) {
                display.value += '0.';
            } else {
                display.value += '.';
            }
        }
    });
});
