//dimension limits for grid
const xRange = {min: 1, max: 3};
const yRange = {min: 3, max: 8};
const xDim = 100;
const yDim = 100;

const initial = {
    xRange,
    yRange,
    xDim,
    yDim
};

load(initial);
submit(initial);

function reset() {
    const resetButton = document.getElementById('clearAll');
    resetButton.addEventListener('click', async (e) => {
        e.preventDefault();
        document.getElementById('form').reset();
        resetColors();
    });
    
}

function load(initial) {
    loadRangeOptions(initial.xRange, initial.yRange);
    loadHexGridOptions();
    listenForRangeOptionsChanges('xRange');
    listenForRangeOptionsChanges('yRange');
    listenForHexGridOptionsChanges();
}

function submit(initial) {
    const submitButton = document.getElementById('submit');
    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        const data = getData(initial.xDim, initial.yDim);
        const ctx = createContext(data[0].canvas);
        createCelShades(ctx, data);
    })
}

function listenForRangeOptionsChanges(id) {
    const item = document.getElementById(id);
    item.addEventListener('change', (e) => {
        loadHexGridOptions();
    });
}

function listenForHexGridOptionsChanges() {
    const hexGridY = [...document.getElementById('hexgrid').childNodes[0].childNodes];
    hexGridY.map((yDiv) => {
        [...yDiv.childNodes].map((xDiv) => {
            xDiv.addEventListener('change', (e) => {
                e.preventDefault();
                xDiv.value = xDiv.value.toUpperCase();
                xDiv.style.backgroundColor = xDiv.value;
            });
        });
    })
}

function resetColors() {
    hexGridY.map((yDiv) => {
        [...yDiv.childNodes].map((xDiv) => {
            xDiv.addEventListener('change', (e) => {
                xDiv.style.backgroundColor = '#FFFFFF';
            });
        });
    })
}

function loadRangeOptions(xRange, yRange) {
    loadRange(xRange, 'xRange');
    loadRange(yRange, 'yRange');
}

function loadHexGridOptions() {
    const range = getRangeSelections();
    const ySubRange = getRangeList({min: 0, max: range.y}, 0);
    const xSubRange = getRangeList({min: 0, max: range.x}, 0);
    const hexGridDiv = document.getElementById('hexgrid');
    hexGridDiv.innerHTML = '';
    const yHexDiv = document.createElement('div');
    ySubRange.map((_) => {
        const xHexDiv = document.createElement('div');
        xSubRange.map((_, id) => {
            const input = document.createElement('input');
            input.value = '#FFFFFF';
            xHexDiv.appendChild(input);
        });
        yHexDiv.appendChild(xHexDiv);
    });
    hexGridDiv.appendChild(yHexDiv);
}

function loadRange(rangeObj, id) {
    const rangeList = getRangeList(rangeObj);
    const select = document.getElementById(id);
    rangeList.map((number) => {
        const option = document.createElement('option');
        option.innerHTML = number;
        option.value = number
        select.appendChild(option);
    });   
}

function getRangeSelections() {
    return {
        x: +document.getElementById('xRange').value,
        y: +document.getElementById('yRange').value
    }
}

function getData(xDim, yDim) {
    const hexGridY = [...document.getElementById('hexgrid').childNodes[0].childNodes];
    const height = hexGridY.length * yDim;
    const width = [...hexGridY[0].childNodes].length * xDim;
    return hexGridY.map((yDiv, y) => {
        return [...yDiv.childNodes].map((xDiv, x) => {
            return {
                block: {
                    x1 : x * xDim,
                    y1 : y * yDim,
                    x2 : xDim,
                    y2 : yDim
                },
                color: calculateRBG(xDiv.value),
                canvas: {
                    height,
                    width
                }
            }
        })
    }).flatMap(_ => _);
}

function getRangeList(rangeObj, offset = 1) {
    if (offset < 0) return [];
    return [...Array((rangeObj.max - rangeObj.min) + offset).keys()].map((_) => _ + rangeObj.min);
}

function calculateRBG(str) {
    const list = [];

    if(!str.split('#')[1]){
        return {hex: str};
    }

    const character = str.split('#')[1].split('');
    for (let x = 0; x < character.length; x+=2){
        const hexStr = character[x]+character[x+1];
        list.push(parseInt(hexStr, 16));
    }
    const rgbObj = list.reduce((obj, dec, id) => {
        const newObj = {}
        switch(id){
            case 0:
                newObj.r = dec;
                break;
            case 1:
                newObj.b = dec;
                break;
            case 2:
                newObj.g = dec;
                break;
        }
        return {...obj, ...newObj};
    }, {})

    return {...rgbObj, hex: str};
}


function createContext(canvasData) {
    const { height, width } = canvasData;
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    return ctx;
}

function createCelShades (ctx, data) {
    data.map((elem, id) => {
        const {x1, y1, x2, y2} = elem.block;
        const {hex} = elem.color;
        ctx.fillRect(x1, y1, x2, y2)
        ctx.fillStyle = hex;
        ctx.fillRect(x1, y1, x2, y2) // for some reason I need this here
    });
}