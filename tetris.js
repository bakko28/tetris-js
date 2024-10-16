import { PLAYFIELD_COLUMNS, PLAYFIELD_ROWS, TETROMINOES, TETROMINO_NAMES, getRandomElement, rotateMatrix } from "./utilites.js";

let recordScore
let score = 0;

export class Tetris {

    constructor() {
        this.playfield;
        this.tetromino;
        this.isGameOver = false;
        this.init();
    }

    init() {
        this.generatePlayField();
        this.generateTetromino();
    }

    generatePlayField() {
        this.playfield = new Array(PLAYFIELD_ROWS).fill()
            .map(() => new Array(PLAYFIELD_COLUMNS).fill(0)); 
        // console.table(this.playfield)
    }

    generateTetromino() {
        const name = getRandomElement(TETROMINO_NAMES);
        const matrix = TETROMINOES[name]

        const column = PLAYFIELD_COLUMNS / 2 - Math.floor(matrix.length / 2);
        const row = -2;

        this.tetromino = {
            name,
            matrix,
            row,
            column,
            ghostColumn: column,
            ghostRow: row,
        }

        this.calculateGhostPosition();
    }

    moveTetrominoDown() {
        this.tetromino.row += 1;
        if (!this.isValid()) {
            this.tetromino.row -= 1;
            this.placeTetromino()
        }
    }

    moveTetrominoLeft() {
        this.tetromino.column -= 1;
        if (!this.isValid()) {
            this.tetromino.column += 1;
        } else {
            this.calculateGhostPosition()
        }
    }

    moveTetrominoRight() {
        this.tetromino.column += 1;
        if (!this.isValid()) {
            this.tetromino.column -= 1;
        } else {
            this.calculateGhostPosition()
        }
    }

    rotateTermino() {
        const oldMatrix = this.tetromino.matrix;
        const rotatedMatrix = rotateMatrix(this.tetromino.matrix);
        this.tetromino.matrix = rotatedMatrix;
        if (!this.isValid()) {
            this.tetromino.matrix = oldMatrix;
        } else {
            this.calculateGhostPosition()
        }
    }

    isValid() {
        const matrixSize = this.tetromino.matrix.length;
        for (let row = 0; row < matrixSize; row++) {
            for (let column = 0; column < matrixSize; column++) {
                if (!this.tetromino.matrix[row][column]) continue;
                if (this.isOutsideOfGameBoard(row, column)) return false;
                if (this.isCollides(row, column)) return false;
            }
        }
        return true;
    }

    isOutsideOfGameBoard(row, column) {
        return this.tetromino.column + column < 0 ||
            this.tetromino.column + column >= PLAYFIELD_COLUMNS ||
            this.tetromino.row + row >= this.playfield.length
    }

    isCollides(row, column) {
        return this.playfield[this.tetromino.row + row]?.[this.tetromino.column + column];
    }

    placeTetromino() {
        this.addScore('basic')
        const matrixSize = this.tetromino.matrix.length;
        for (let row = 0; row < matrixSize; row++) {
            for (let column = 0; column < matrixSize; column++) {
                if (!this.tetromino.matrix[row][column]) continue;
                if (this.isOutsideOfTopBoard(row)) {
                    this.isGameOver = true;
                    return;
                }

                this.playfield[this.tetromino.row + row][this.tetromino.column + column] = this.tetromino.name;
            }
        }

        this.processFilledRows();
        this.generateTetromino();
    }

    isOutsideOfTopBoard(row) {
        return this.tetromino.row + row < 0;
    }

    processFilledRows() {
        const filledLines = this.findFilledRows()
        this.removeFilledRows(filledLines);
    }

    findFilledRows() {
        const filledRows = [];
        for (let row = 0; row < PLAYFIELD_ROWS; row++) {
            if (this.playfield[row].every(cell => Boolean(cell))) {
                filledRows.push(row);
            }
        }

        return filledRows
    }

    removeFilledRows(filledRows) {
        filledRows.forEach(row => {
            this.dropRowsAbove(row)
            this.addScore('line')
        })
    }

    dropRowsAbove(rowToDelete) {
        for (let row = rowToDelete; row > 0; row--) {
            this.playfield[row] = this.playfield[row -1];
        }
        this.playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
    }

    calculateGhostPosition() {
        const tetrominoRow = this.tetromino.row;
        this.tetromino.row++;
        while (this.isValid()) {
            this.tetromino.row++
        }

        this.tetromino.ghostRow = this.tetromino.row - 1;
        this.tetromino.ghostColumn = this.tetromino.column;
        this.tetromino.row = tetrominoRow;
    }

    addScore(type) {
        if (type != 'basic') {
            score += 100
        } else {
            score += 10
        }
        document.querySelector('.score').textContent = `Score: ${score}`
        this.countingScore(score)
    }

    countingScore(score) {
        let localRecordScore = Number(JSON.parse(localStorage.getItem('recordScore')));
        console.log(localRecordScore, score);
        if (score > localRecordScore) {
            localStorage.setItem('recordScore', score); // Изменение здесь
            document.querySelector('.record-score').textContent = `Record: ${localRecordScore}`; // И здесь
        } else {
            console.log('До рекорда не хватает: ' + (localRecordScore - score));
            document.querySelector('.record-score').textContent = `Record: ${localRecordScore}`;
        }
    }    
}