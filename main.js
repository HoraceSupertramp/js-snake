const grid = document.querySelector('#grid');

/**
 * Indica se la partita è finita e l'utente ha vinto
 */
let isWon = false;

/**
 * Indica se la partita è finita e l'utente ha perso
 */
let isLost = false;

/**
 * Rappresenta la direzione della testa del serpente
 */
let direction = 'right';

/**
 * Rappresenta la dimensione della griglia
 */
let size = 10;

/**
 * Rappresenta la lista delle unità del serpente, dove:
 * - All'indice 0 ho la testa
 * - All'indice length - 1 ho la fine della coda
 * Ogni elemento della lista è un oggetto con le chiavi:
 * - "position": la posizione sulla griglia occupata dall'unità
 * - "isDigesting": indica se in questo punto il serpente sta digerendo del cibo
 * - "isFailed": indica se in questo punto il serpente presenta una rottura fatale
 *               che ha appena causato la fine del gioco
 */
let snake = [];

/**
 * Rappresenta la lista delle celle che sono cibo per serpente 
 */
let food;

initialize();
start();

/**
 * Inizializza il campo di gioco e lo stato iniziale delle variabili
 */
function initialize() {
    snake.push({
        position: Math.floor(size * size / 2),
        isDigesting: false,
        isFailed: false,
    });
    generateGrid();
    generateFood();
    paintGameState();
    document.addEventListener('keydown', keydown);
}

/**
 * Avvia il loop di gioco
 */
function start() {
    setTimeout(() => {
        updateGameState();
        paintGameState();
        if (isWon || isLost) {
            end();
        } else {
            start();
        }
    }, 800);
}

/**
 * Ripulisce e gestisce il fine prtita
 */
function end() {
    document.removeEventListener('keydown', keydown);
    if (isWon) {
        document.querySelector('#win').classList.add('visible');
        grid.classList.add('won');
    } else if (isLost) {
        document.querySelector('#score').innerText = snake.length;
        document.querySelector('#loss').classList.add('visible');
    }
}

/**
 * Gestisce l'evento keydown
 */
function keydown(event) {
    let selectedDirection;
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
    if (snake.length === 1 || !isOpposite(selectedDirection, direction)) {
        direction = selectedDirection;
        updateHeadRotation();
    }
}

/**
 * Genera una nuova casella di cibo per il serpente, se possibile
 */
function generateFood() {
    const free = getFreeCells();
    if (free.length !== 0) {
        const index = Math.floor(Math.random() * free.length);
        food = free[index];
    } else {
        food = null;
    }
}

/**
 * Genera la griglia
 */
function generateGrid() {
    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.setAttribute('data-i', i);
        cell.style.width = `${grid.clientWidth / size}px`;
        grid.appendChild(cell);
    }
}

/**
 * Aggiorna in pagina la rotazione della testa del serpente
 */
function updateHeadRotation() {
    const cells = grid.querySelectorAll('div');
    const head = cells[snake[0].position];
    head.classList.remove('left', 'right', 'bottom', 'top');
    head.classList.add(direction);
}

/**
 * Aggiorna in pagina la griglia in base allo stato di gioco
 * specificato da tutte le variabili
 */
function paintGameState() {
    const cells = grid.querySelectorAll('div');
    cells.forEach((cell) => {
        cell.classList.remove('food', 'snake', 'digesting', 'head', 'left', 'right', 'bottom', 'top');
    });
    snake.forEach((snake) => {
        cells[snake.position].classList.add('snake');
        if (snake.isDigesting) {
            cells[snake.position].classList.add('digesting');
        }
        if (snake.isFailed) {
            cells[snake.position].classList.add('fail');
        }
    });
    cells[snake[0].position].classList.add('head');
    updateHeadRotation();
    if (food != null) {
        cells[food].classList.add('food');
    }
}

/**
 * Aggiorna tutte le variabili in modo coerente con il modello di gioco
 */
function updateGameState() {
    const tail = snake[snake.length - 1];
    const head = snake[0];
    if (tail.isDigesting) {
        snake.push({
            position: tail.position,
            isDigesting: false,
        });
        tail.isDigesting = false;
    }
    if (isCollidingWithEdges(direction, head.position)) {
        head.isFailed = true;
        isLost = true;
    } else {
        const position = getNextHeadPosition(direction, head.position);
        const collided = getSelfCollision(position);
        if (collided) {
            collided.isFailed = true;
            isLost = true;
        } else {
            for (let i = snake.length - 1; i > 0; i--) {
                snake[i].position = snake[i - 1].position;
                snake[i].isDigesting = snake[i - 1].isDigesting;
            }
            head.position = position;
            if (food === position) {
                head.isDigesting = true;
                generateFood();
                if (food == null) {
                    isWon = true;
                }
            } else {
                head.isDigesting = false;
            }
        }
    }
}

/**
 * Calcola la nuova posizione della testa del serpente
 * 
 * @param {*} direction La direzione del serpente
 * @param {*} position  La posizione attuale della testa del serpente
 * @returns             La nuova posizione della testa del serpente
 */
function getNextHeadPosition(direction, position) {
    switch(direction) {
        case 'right':
            return position + 1;
        case 'left':
            return position - 1;
        case 'top':
            return position - size;
        case 'bottom':
            return position + size;
    }
}

/**
 * Recupera le celle vuote della griglia 
 * 
 * @returns L'array degli indici corrispondenti alle celle vuote
 */
function getFreeCells() {
    const free = [];
    for (let i = 0; i < size * size; i++) {
        let isSnakePosition = false;
        for (let j = 0; j < snake.length; j++) {
            if (snake[j].position === i) {
                isSnakePosition = true;
            }
        }
        if (!isSnakePosition) {
            free.push(i);
        }
    }
    return free;
}

/**
 * @param {*} direction La direzione del serpente
 * @param {*} position  La posizione attuale della testa del serpente
 * @returns             Un booleano che indica se la testa del serpente
 *                      si è scontrata con i bordi esterni della griglia
 */
function isCollidingWithEdges(direction, position) {
    const isTouchingRight = (
        direction === 'right' &&
        (position + 1) % size === 0
    );
    const isTouchingLeft = (
        direction === 'left' &&
        position % size === 0
    );
    const isTouchingTop = (
        direction === 'top' &&
        position < size
    );
    const isTouchingBottom = (
        direction === 'bottom' &&
        position >= (size * size) - size
    );
    return (
        isTouchingRight ||
        isTouchingBottom ||
        isTouchingLeft ||
        isTouchingTop
    );
}

/**
 * @param {*} position  La posizione attuale della testa del serpente
 * @returns             L'unità del serpente con cui il serpente stesso si è scontrato
 */
function getSelfCollision(position) {
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].position === position) {
            return snake[i];
        }
    }
    return null;
}

/**
 * Indica se due direzioni sono opposte
 * 
 * @param {*} direction1 La prima direzione da confrontare
 * @param {*} direction2 La seconda direzione da confrontare
 * @returns Un booleano che indica se direction1 e direction2 sono opposte
 */
function isOpposite(direction1, direction2) {
    return (
        (direction1 === 'right' && direction2 === 'left') ||
        (direction1 === 'left' && direction2 === 'right') ||
        (direction1 === 'top' && direction2 === 'bottom') ||
        (direction1 === 'bottom' && direction2 === 'top')
    );
}