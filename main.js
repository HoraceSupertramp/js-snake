const container = document.querySelector('.container');
/**
 * Rappresenta la direzione della testa del serpente
 */
let direction = 'left';
let selectedDirection = 'left';

/**
 * Rappresenta la lista delle unità del serpente, dove:
 * - All'indice 0 ho la testa
 * - All'indice length - 1 ho la fine della coda
 * Ogni elemento della lista è un oggetto con le chiavi:
 * - "position": la posizione sulla griglia occupata dall'unità
 * - "isDigesting": indica se in questo punto il serpente sta digerendo del cibo
 */
let snake = [{
    position: 55,
    isDigesting: false,
}];
/**
 * Rappresenta la lista delle celle che sono cibo per serpente 
 */
let food = [];
let loop;

initialize();
start();

function initialize() {
    generateFood();
    generateGrid();
    updateHTML();
}

function start() {
    loop = setInterval(() => {
        updateVariables();
        updateHTML();
    }, 800);
    document.addEventListener('keydown', function(event) {
        switch(event.code) {
            case "ArrowLeft":
                selectedDirection = 'left';
                break;
            case "ArrowUp":
                selectedDirection = 'top';
                break;
            case "ArrowDown":
                selectedDirection = 'bottom';
                break;
            case "ArrowRight":
                selectedDirection = 'right';
                break;
        }
    });
}

function stop() {
    clearInterval(loop);
    console.log('done');
}

function generateFood() {
    while (food.length !== 5) {
        const random = Math.floor(Math.random() * 100);
        if (!food.includes(random) && snake[0] !== random) {
            food.push(random);
        }
    }
}

function generateGrid() {
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.setAttribute('data-i', i);
        container.appendChild(cell);
    }
}

function updateHTML() {
    const cells = document.querySelectorAll('.container > div');
    cells.forEach((cell) => {
        cell.classList.remove('food', 'snake', 'digesting');
    });
    snake.forEach((snake) => {
        cells[snake.position].classList.add('snake');
        if (snake.isDigesting) {
            cells[snake.position].classList.add('digesting');
        }
    });
    food.forEach((food) => {
        cells[food].classList.add('food');
    });
}

function updateVariables() {
    if (snake.length === 1 || !isOpposite(direction, selectedDirection)) {
        direction = selectedDirection;
    }
    const tail = snake[snake.length - 1];
    const head = snake[0];
    if (tail.isDigesting) {
        snake.push({
            position: tail.position,
            isDigesting: false,
        });
        tail.isDigesting = false;
        if (snake.length === 100) {
            stop(true);
            return;
        }
    }
    for (let i = snake.length - 1; i > 0; i--) {
        snake[i].position = snake[i - 1].position;
        snake[i].isDigesting = snake[i - 1].isDigesting;
    }
    if (isTouchingEdges(direction, head.position)) {
        stop(false);
        return;
    }
    const position = getNextPosition(direction, head.position);
    if (isBitingItself(position)) {
        stop(false);
        return;
    }
    head.position = position;
    if (food.includes(head.position)) {
        head.isDigesting = true;
        food = removeFromArray(food, head.position);
    } else {
        head.isDigesting = false;
    }
}

function getNextPosition(direction, position) {
    switch(direction) {
        case 'right':
            return position + 1;
        case 'left':
            return position - 1;
        case 'top':
            return position - 10;
        case 'bottom':
            return position + 10;
    }
}

function removeFromArray(array, element) {
    return array.filter((item) => item !== element);
}

function isTouchingEdges(direction, position) {
    const isTouchingRight = (
        direction === 'right' &&
        (position + 1) % 10 === 0
    );
    const isTouchingLeft = (
        direction === 'left' &&
        position % 10 === 0
    );
    const isTouchingTop = (
        direction === 'top' &&
        position < 10
    );
    const isTouchingBottom = (
        direction === 'bottom' &&
        position >= 90
    );
    return (
        isTouchingRight ||
        isTouchingBottom ||
        isTouchingLeft ||
        isTouchingTop
    );
}

function isBitingItself(position) {
    return snake.slice(1).some((snake) => snake.position === position);
}

function isOpposite(direction1, direction2) {
    return (
        (direction1 === 'right' && direction2 === 'left') ||
        (direction1 === 'left' && direction2 === 'right') ||
        (direction1 === 'top' && direction2 === 'bottom') ||
        (direction1 === 'bottom' && direction2 === 'top')
    );
}