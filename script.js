const grid = document.getElementById('number-grid');
const bins = document.querySelectorAll('.bin');
const progressEl = document.getElementById('progress');
const terminal = document.getElementById('terminal');
const folderOverlay = document.getElementById('folder-overlay');
const progressFill = document.getElementById('progress-fill');
const reviewContainer = document.getElementById('review-container');
const employeeDisplay = document.getElementById('employee-display');
let progress = 0;
const targetProgress = 75;
const totalScary = 60;
let scaryNumbers = [];
let groupedNumbers = new Set();

// Set employee name from URL
const urlParams = new URLSearchParams(window.location.search);
const employeeName = urlParams.get('name') || '[REDACTED]';
employeeDisplay.textContent = employeeName.toUpperCase();

// Generate "scary" numbers
function generateScaryNumbers() {
    const nums = new Set();
    while (nums.size < totalScary) {
        const num = Math.floor(Math.random() * 99) + 1;
        if (Math.random() > 0.7 || isPrime(num) || num % 11 === 0) {
            nums.add(num);
        }
    }
    return Array.from(nums);
}

function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
}

// Generate dynamic grid
function generateGrid() {
    scaryNumbers = generateScaryNumbers();
    const allNumbers = [];
    const minColumns = 15;
    const columnWidth = 40 + 4;
    const terminalWidth = terminal.offsetWidth - 40;
    const columns = Math.max(minColumns, Math.floor(terminalWidth / columnWidth));
    const rows = 15;
    const gridSize = columns * rows;

    for (let i = 0; i < gridSize - totalScary; i++) {
        let num;
        do {
            num = Math.floor(Math.random() * 99) + 1;
        } while (scaryNumbers.includes(num));
        allNumbers.push(num);
    }
    allNumbers.push(...scaryNumbers);
    shuffle(allNumbers);

    allNumbers.forEach((num, index) => {
        const div = document.createElement('div');
        div.className = 'number';
        div.textContent = num;
        div.dataset.index = index;
        div.draggable = true;

        div.addEventListener('dragstart', (e) => {
            if (groupedNumbers.has(num)) {
                const group = Array.from(groupedNumbers);
                e.dataTransfer.setData('text', JSON.stringify(group));
            } else {
                e.dataTransfer.setData('text', num);
            }
        });

        div.addEventListener('mouseover', () => {
            if (scaryNumbers.includes(num)) {
                groupNearbyScaryNumbers(index, allNumbers, columns);
            }
        });

        div.addEventListener('mouseout', () => {
            clearGroup();
        });

        grid.appendChild(div);
    });

    startPopOutEffect();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function groupNearbyScaryNumbers(index, allNumbers, columns) {
    groupedNumbers.clear();
    const row = Math.floor(index / columns);
    const col = index % columns;
    const numbers = document.querySelectorAll('.number');

    numbers.forEach(n => {
        const nIndex = parseInt(n.dataset.index);
        const nRow = Math.floor(nIndex / columns);
        const nCol = nIndex % columns;
        const num = parseInt(n.textContent);

        if (scaryNumbers.includes(num) && Math.abs(nRow - row) <= 1 && Math.abs(nCol - col) <= 1) {
            n.classList.add('grouped');
            groupedNumbers.add(num);
        }
    });
}

function clearGroup() {
    document.querySelectorAll('.number').forEach(n => {
        n.classList.remove('grouped');
    });
    groupedNumbers.clear();
}

function startPopOutEffect() {
    setInterval(() => {
        if (progress < targetProgress) {
            const numbers = document.querySelectorAll('.number');
            numbers.forEach(n => {
                const num = parseInt(n.textContent);
                if (scaryNumbers.includes(num)) {
                    n.classList.add('popped');
                    setTimeout(() => n.classList.remove('popped'), 1000);
                }
            });
        }
    }, Math.floor(Math.random() * 10000) + 10000);
}

function handleDrop(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData('text');
    let nums;

    try {
        nums = JSON.parse(data);
    } catch {
        nums = [parseInt(data)];
    }

    let validDrop = false;
    nums.forEach(num => {
        if (scaryNumbers.includes(num)) {
            validDrop = true;
            const index = scaryNumbers.indexOf(num);
            scaryNumbers.splice(index, 1);
            removeNumberFromGrid(num);
        }
    });

    if (validDrop) {
        progress = Math.min(((totalScary - scaryNumbers.length) / totalScary) * 100, 100);
        progressEl.textContent = `${progress.toFixed(0)}%`;
        if (progress >= targetProgress) {
            showFolderOverlay();
        }
    } else {
        alert('That selection does not require refinement. Trust your instincts.');
    }
}

function removeNumberFromGrid(num) {
    const numbers = document.querySelectorAll('.number');
    numbers.forEach(n => {
        if (parseInt(n.textContent) === num) {
            n.remove();
        }
    });
}

function showFolderOverlay() {
    terminal.classList.add('hidden');
    folderOverlay.classList.remove('hidden');
    let fillProgress = 0;
    const interval = setInterval(() => {
        fillProgress += 2;
        progressFill.style.width = `${fillProgress}%`;
        if (fillProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                folderOverlay.classList.add('hidden');
                reviewContainer.classList.remove('hidden');
            }, 500);
        }
    }, 40);
}

bins.forEach(bin => {
    bin.addEventListener('dragover', (e) => e.preventDefault());
    bin.addEventListener('drop', handleDrop);
});

// Start the grid on page load
generateGrid();