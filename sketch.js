let flyImg;
let miniMapG;

var w, h, tow, toh;
var x, y, tox, toy;
var zoom = .01; //zoom step per mouse tick


function preload() {
    let bmp1 = 'sample_flymap.bmp';
    let bmp2 = 'flyav.bmp';
    let bmp = 'flymaps/' + bmp1;
    flyImg = loadImage(bmp);
    flyImg.loadPixels()
    console.log(`flyImg.height, flyImg.width`, flyImg.height, flyImg.width);
    miniMapG = createGraphics(100, 100)

}

function setup() {
    w = tow = 450;
    h = toh = 450;
    createCanvas(w, h);
    x = tox = w / 2;
    y = toy = h / 2;
    targetVec = createVector(width / 2, height / 2)
}

let flyMapOrig
let targetVec

let pixelSize = 7
let frame = 0
let zoomBasis = 3500;

function draw() {
    flyMapOrig = createVector(10, 10)
    background(220, 220, 220);

    let lerpFactor = .3;
    x = lerp(x, tox, lerpFactor);
    y = lerp(y, toy, lerpFactor);
    w = lerp(w, tow, lerpFactor);
    h = lerp(h, toh, lerpFactor);
    miniMapG.clear()
    for (let x = 0; x < width; x += pixelSize) {
        for (let y = 0; y < height; y += pixelSize) {
            // getBiomeForWorldPoint(createVector(x, y))
            let relSv = createVector(x / pixelSize, y / pixelSize);
            let worldPoint = targetVec.copy().add(relSv.mult(h / zoomBasis));
            let c = getBiomeForWorldPoint(worldPoint);
            drawFly(worldPoint, relSv)
            fill(c);
            stroke(c)
            rect(x, y, pixelSize, pixelSize);
        }
    }

    // console.log(`r`, miniMapImg.pixels);
    updateMinimap()

    // image(img, x-w/2, y-h/2, w, h);
    frame++;
}

let colored = false
let drawFly = (wp, relSv, fill = 80) => {

    // miniMapG.fill(fill, fill, fill, 15);
    let grayFactor = (relSv.x - (relSv.y / 2)) / 2.5 + 0.6;
    if (colored)
        miniMapG.stroke(grayFactor * 255, (grayFactor + relSv.y / 12) * 255, (grayFactor + relSv.y / 6) * 255, 50)
    else
        miniMapG.stroke(fill, fill, fill, 50)
    let fp = getFlyPosForWorldPoint(wp)

    miniMapG.point(fp.fx, fp.fy, 1, 1)
}

let updateMinimap = () => {
    image(flyImg, flyMapOrig.x, flyMapOrig.y);


    // if (frame % 500 == 0) {
    //     for (let x = 0; x < w; x++) {
    //         for (let y = 0; y < h; y++) {
    //             drawFly(createVector(x, y))
    //         }
    //     }
    // }


    // drawFly(targetVec, targetVec)

    miniMapG.updatePixels()

    // miniMapG.clear( 144)
    // miniMapG.fill(255, 3, 144)

    // miniMapG.background(51);
    image(miniMapG, flyMapOrig.x, flyMapOrig.y, flyImg.height, flyImg.width);
}
let minX = 100
let maxX = 0
let minY = 100
let maxY = 0

let a = 1 - Math.sqrt(2) / 2

let getFlyPosForWorldPoint = (p) => {
    let noiseFreq = 0.001;
    var fx = (1.5 * 100 * (noise(noiseFreq * p.x + 1000, noiseFreq * p.y + 1000) - a) / (2 * a)) % 100;
    var fy = (1.5 * 100 * (noise(noiseFreq * p.x + 2000, noiseFreq * p.y + 2000) - a) / (2 * a)) % 100;
    minX = Math.min(minX, fx)
    maxX = Math.max(maxX, fx)
    minY = Math.min(minY, fy)
    maxY = Math.max(maxY, fy)
    // console.log(`[minX, maxX], [minY, maxY]`, [minX, maxX], [minY, maxY]);
    return {fx, fy}
}
let getBiomeForWorldPoint = (p) => {
    let fp = getFlyPosForWorldPoint(p)
    // point(fx, fy, 0)
    let color = flyImg.get(fp.fx, fp.fy)
    // console.log(`col`, color, fx, fy, p);
    // console.log(`PILOTASSA`);
    return color
}


function mouseDragged(event) {
    tox += mouseX - pmouseX;
    toy += mouseY - pmouseY;

    let z = h / zoomBasis

    targetVec.add(-event.movementX * z / (pixelSize * 2), -event.movementY * z / (pixelSize * 2))
}

function mouseWheel(event) {
    var e = -event.delta;

    if (e > 0) { //zoom in
        for (var i = 0; i < e; i++) {
            if (tow > 30 * width) return; //max zoom
            tox -= zoom * (mouseX - tox);
            toy -= zoom * (mouseY - toy);
            tow *= zoom + 1;
            toh *= zoom + 1;
        }
    }

    if (e < 0) { //zoom out
        for (let i = 0; i < -e; i++) {
            if (tow < width) return; //min zoom
            tox += zoom / (zoom + 1) * (mouseX - tox);
            toy += zoom / (zoom + 1) * (mouseY - toy);
            toh /= zoom + 1;
            tow /= zoom + 1;
        }
    }
}