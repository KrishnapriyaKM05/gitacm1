const svg = document.getElementById("pookkalam");
const svgNS = "http://www.w3.org/2000/svg";
const center = { x: 300, y: 300 };


function polarToCartesian(cx, cy, radius, angleDegrees) {
    const angleRadians = (angleDegrees - 90) * Math.PI / 180;
    const x = cx + radius * Math.cos(angleRadians);
    const y = cy + radius * Math.sin(angleRadians);
    return { x: x, y: y };
}



function createPolygon(points, color) {
    const polygon = document.createElementNS(svgNS, "polygon");
    const pointString = points.map(p => `${p.x},${p.y}`).join(" ");
    polygon.setAttribute("points", pointString);
    polygon.setAttribute("fill", color);
    svg.appendChild(polygon);
}


function annularSectorPath(cx, cy, innerR, outerR, startAngle, endAngle) {
    const startOuter = polarToCartesian(cx, cy, outerR, endAngle);
    const endOuter   = polarToCartesian(cx, cy, outerR, startAngle);
    const startInner = polarToCartesian(cx, cy, innerR, endAngle);
    const endInner   = polarToCartesian(cx, cy, innerR, startAngle);
    const largeArcFlag = (endAngle - startAngle) <= 180 ? "0" : "1";
    return [
        "M", startOuter.x, startOuter.y,
        "A", outerR, outerR, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
        "L", endInner.x, endInner.y,
        "A", innerR, innerR, 0, largeArcFlag, 1, startInner.x, startInner.y,
        "Z"
    ].join(" ");
}

function createSector(innerR, outerR, startAngle, endAngle, color) {
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", annularSectorPath(center.x, center.y, innerR, outerR, startAngle, endAngle));
    path.setAttribute("fill", color);
    svg.appendChild(path);
}


function createRingBand(innerR, outerR, color) {
    createSector(innerR, outerR, 0, 180, color);
    createSector(innerR, outerR, 180, 360, color);
}


function createTriangleRing(innerR, outerR, count, color, overlapDeg = 0.6) {
    const anglePerTriangle = 360 / count;
    for (let i = 0; i < count; i++) {
        const startAngle = i * anglePerTriangle - overlapDeg;
        const endAngle = startAngle + anglePerTriangle + overlapDeg * 2;
        const midAngle = i * anglePerTriangle + anglePerTriangle / 2;

        const baseLeft  = polarToCartesian(center.x, center.y, innerR, startAngle);
        const baseRight = polarToCartesian(center.x, center.y, innerR, endAngle);
        const tip       = polarToCartesian(center.x, center.y, outerR, midAngle);

        createPolygon([baseLeft, baseRight, tip], color);
    }
}


function createDiamondRing(innerR, outerR, count, color, overlapDeg = 1.5) {
    const anglePerDiamond = 360 / count;
    const midR = (innerR + outerR) / 2;
    for (let i = 0; i < count; i++) {
        const startAngle = i * anglePerDiamond - overlapDeg;
        const endAngle = startAngle + anglePerDiamond + overlapDeg;
        const midAngle = i * anglePerDiamond + anglePerDiamond / 2;

        const top    = polarToCartesian(center.x, center.y, outerR, midAngle);
        const bottom = polarToCartesian(center.x, center.y, innerR, midAngle);
        const left   = polarToCartesian(center.x, center.y, midR, startAngle);
        const right  = polarToCartesian(center.x, center.y, midR, endAngle);

        createPolygon([top, right, bottom, left], color);
    }
}


function createWedgeRing(innerR, outerR, wedgeCount, subCount, colors, flip) {
    const wedgeAngle = 360 / wedgeCount;

    for (let w = 0; w < wedgeCount; w++) {
        const wedgeStart = w * wedgeAngle;
        const wedgeEnd = wedgeStart + wedgeAngle;

        let useAngularSplit = (w % 2 === 0);
        if (flip) useAngularSplit = !useAngularSplit;

        if (useAngularSplit) {
            
            const subAngle = wedgeAngle / subCount;
            for (let s = 0; s < subCount; s++) {
                const subStart = wedgeStart + s * subAngle;
                const subEnd = subStart + subAngle;
                createSector(innerR, outerR, subStart, subEnd, colors[s]);
            }
        } else {
            
            const bandDepth = (outerR - innerR) / subCount;
            for (let s = 0; s < subCount; s++) {
                const rStart = innerR + s * bandDepth;
                const rEnd = rStart + bandDepth;
                createSector(rStart, rEnd, wedgeStart, wedgeEnd, colors[s]);
            }
        }
    }
}


const GREEN  = "#2e8b3d";
const PINK  = "#a14b7d";
const YELLOW = "#ffd400";
const ORANGE = "#ff8c00";
const RED    = "#e63946";
const VIOLET = "#7b2cbf";

const fiveColorSequence = [PINK, YELLOW, ORANGE, RED, VIOLET];




createTriangleRing(10, 45, 16, GREEN);     
createRingBand(45, 58,PINK);              
createRingBand(58, 71, YELLOW);             
createRingBand(71, 84, ORANGE);             
createRingBand(84, 97, RED);                
createRingBand(97, 110, GREEN);             
createTriangleRing(110, 140, 16,PINK);   
createDiamondRing(140, 160, 16, YELLOW);   
createDiamondRing(160, 180, 16, ORANGE);    
createTriangleRing(180, 205, 16, RED);      
createRingBand(205, 220, VIOLET);           

createWedgeRing(220, 255, 8, 5, fiveColorSequence, false); 
createWedgeRing(255, 290, 8, 5, fiveColorSequence, true);  