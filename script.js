const svg = document.getElementById("footballPitch");

const ballGroup = document.getElementById("ballGroup");
const playerImage = document.getElementById("playerImage");
const targetGroup = document.getElementById("targetGroup");
const shotLine = document.getElementById("shotLine");
const movingBall = document.getElementById("movingBall");

const xAxis = document.getElementById("xAxis");
const yAxis = document.getElementById("yAxis");
const xAxisLabel = document.getElementById("xAxisLabel");
const yAxisLabel = document.getElementById("yAxisLabel");
const originLabel = document.getElementById("originLabel");

const horizontalLeg = document.getElementById("horizontalLeg");
const verticalLeg = document.getElementById("verticalLeg");
const deltaXLabel = document.getElementById("deltaXLabel");
const deltaYLabel = document.getElementById("deltaYLabel");

const angleArc = document.getElementById("angleArc");
const angleLabel = document.getElementById("angleLabel");

const equationDisplay = document.getElementById("equationDisplay");
const equationExplanation = document.getElementById("equationExplanation");

const slopeValue = document.getElementById("slopeValue");
const angleValue = document.getElementById("angleValue");
const tangentValue = document.getElementById("tangentValue");
const pathLengthValue = document.getElementById("pathLengthValue");
const identityResult = document.getElementById("identityResult");

const distanceSlider = document.getElementById("distanceSlider");
const ballSideSlider = document.getElementById("ballSideSlider");
const targetSlider = document.getElementById("targetSlider");

const distanceValue = document.getElementById("distanceValue");
const ballSideValue = document.getElementById("ballSideValue");
const targetValue = document.getElementById("targetValue");

const kickButton = document.getElementById("kickButton");
const resetButton = document.getElementById("resetButton");

const pixelsPerMeter = 12;
const goalLineY = 40;
const fieldCenterX = 478;

const minimumDistance = 8;
const maximumDistance = 22;
const maximumBallSide = 10;
const halfGoalWidth = 3.66;

let dragging = null;
let animationFrame = null;

function formatNumber(number, decimals = 2) {
  const rounded = Math.round(number * 10 ** decimals) / 10 ** decimals;
  if (Math.abs(rounded) < 0.0001) return "0";
  if (Number.isInteger(rounded)) return rounded.toString();
  return rounded.toFixed(decimals).replace(/0+$/, "").replace(/\.$/, "");
}

function distanceToSvgY(distance) {
  return goalLineY + distance * pixelsPerMeter;
}

function sideToSvgX(sidePosition) {
  return fieldCenterX + sidePosition * pixelsPerMeter;
}

function svgXToSide(svgX) {
  return (svgX - fieldCenterX) / pixelsPerMeter;
}

function svgYToDistance(svgY) {
  return (svgY - goalLineY) / pixelsPerMeter;
}

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function createAngleArcPath(centerX, centerY, radius, angleDegrees) {
  const startAngle = -90;
  const endAngle = startAngle + angleDegrees;

  const startX = centerX + radius * Math.cos(degreesToRadians(startAngle));
  const startY = centerY + radius * Math.sin(degreesToRadians(startAngle));
  const endX = centerX + radius * Math.cos(degreesToRadians(endAngle));
  const endY = centerY + radius * Math.sin(degreesToRadians(endAngle));
  const sweepFlag = angleDegrees >= 0 ? 1 : 0;

  return `M ${startX} ${startY} A ${radius} ${radius} 0 0 ${sweepFlag} ${endX} ${endY}`;
}

function updateScene() {
  const distance = Number(distanceSlider.value);
  const ballSide = Number(ballSideSlider.value);
  const targetSide = Number(targetSlider.value);

  const ballX = sideToSvgX(ballSide);
  const ballY = distanceToSvgY(distance);
  const targetX = sideToSvgX(targetSide);
  const targetY = goalLineY;

  const deltaX = distance;
  let deltaY = targetSide - ballSide;
  if (Math.abs(deltaY) < 0.005) deltaY = 0;

  const slope = deltaY / deltaX;
  const angleRadians = Math.atan(slope);
  const angleDegrees = deltaY === 0 ? 0 : angleRadians * 180 / Math.PI;
  const tangent = deltaY === 0 ? 0 : Math.tan(angleRadians);
  const pathLength = Math.sqrt(deltaX ** 2 + deltaY ** 2);

  ballGroup.setAttribute("transform", `translate(${ballX}, ${ballY})`);
  playerImage.setAttribute("x", ballX - 46);
  playerImage.setAttribute("y", ballY + 12);
  targetGroup.setAttribute("transform", `translate(${targetX}, ${targetY})`);

  shotLine.setAttribute("x1", ballX);
  shotLine.setAttribute("y1", ballY);
  shotLine.setAttribute("x2", targetX);
  shotLine.setAttribute("y2", targetY);

  updateAxes(ballX, ballY);
  updateSlopeTriangle(ballX, ballY, targetX, targetY, deltaX, deltaY);
  updateAngle(ballX, ballY, angleDegrees);
  updateMathematicalDisplay(slope, angleDegrees, tangent, pathLength, distance, ballSide, targetSide);
}

function updateAxes(ballX, ballY) {
  xAxis.setAttribute("x1", ballX);
  xAxis.setAttribute("y1", ballY);
  xAxis.setAttribute("x2", ballX);
  xAxis.setAttribute("y2", Math.max(goalLineY + 10, ballY - 145));

  yAxis.setAttribute("x1", ballX - 100);
  yAxis.setAttribute("y1", ballY);
  yAxis.setAttribute("x2", ballX + 125);
  yAxis.setAttribute("y2", ballY);

  xAxisLabel.setAttribute("x", ballX + 10);
  xAxisLabel.setAttribute("y", Math.max(goalLineY + 26, ballY - 150));
  yAxisLabel.setAttribute("x", ballX + 132);
  yAxisLabel.setAttribute("y", ballY + 6);
  originLabel.setAttribute("x", ballX + 10);
  originLabel.setAttribute("y", ballY + 28);
}

function updateSlopeTriangle(ballX, ballY, targetX, targetY, deltaX, deltaY) {
  horizontalLeg.setAttribute("x1", ballX);
  horizontalLeg.setAttribute("y1", ballY);
  horizontalLeg.setAttribute("x2", ballX);
  horizontalLeg.setAttribute("y2", targetY);

  verticalLeg.setAttribute("x1", ballX);
  verticalLeg.setAttribute("y1", targetY);
  verticalLeg.setAttribute("x2", targetX);
  verticalLeg.setAttribute("y2", targetY);

  deltaXLabel.setAttribute("x", ballX + 12);
  deltaXLabel.setAttribute("y", (ballY + targetY) / 2);
  deltaXLabel.textContent = `Δx = ${formatNumber(deltaX)} מ׳`;

  deltaYLabel.setAttribute("x", (ballX + targetX) / 2);
  deltaYLabel.setAttribute("y", targetY + 24);
  deltaYLabel.setAttribute("text-anchor", "middle");
  deltaYLabel.textContent = `Δy = ${formatNumber(deltaY)} מ׳`;

  const isZero = Math.abs(deltaY) < 0.005;
  verticalLeg.style.opacity = isZero ? "0" : "1";
  deltaYLabel.style.opacity = isZero ? "0" : "1";
}

function updateAngle(ballX, ballY, angleDegrees) {
  const radius = 48;
  if (Math.abs(angleDegrees) < 0.2) {
    angleArc.setAttribute("d", "");
    angleLabel.style.opacity = "0";
    return;
  }

  angleLabel.style.opacity = "1";
  angleArc.setAttribute("d", createAngleArcPath(ballX, ballY, radius, angleDegrees));

  const middleAngle = -90 + angleDegrees / 2;
  const labelX = ballX + 66 * Math.cos(degreesToRadians(middleAngle));
  const labelY = ballY + 66 * Math.sin(degreesToRadians(middleAngle));

  angleLabel.setAttribute("x", labelX);
  angleLabel.setAttribute("y", labelY);
  angleLabel.textContent = "θ";
}

function updateMathematicalDisplay(slope, angleDegrees, tangent, pathLength, distance, ballSide, targetSide) {
  equationDisplay.textContent = Math.abs(slope) < 0.0001 ? "y = 0" : `y = ${formatNumber(slope, 3)}x`;

  let explanation = "הכדור נע ישר קדימה אל מרכז השער.";
  if (slope > 0.001) explanation = "השיפוע חיובי: מסלול הכדור פונה ימינה ביחס לכיוון השער.";
  if (slope < -0.001) explanation = "השיפוע שלילי: מסלול הכדור פונה שמאלה ביחס לכיוון השער.";

  equationExplanation.textContent = explanation;
  slopeValue.textContent = formatNumber(slope, 3);
  angleValue.textContent = `${formatNumber(angleDegrees, 2)}°`;
  tangentValue.textContent = formatNumber(tangent, 3);
  pathLengthValue.textContent = `${formatNumber(pathLength, 2)} מ׳`;
  distanceValue.textContent = `${formatNumber(distance)} מ׳`;
  ballSideValue.textContent = `${formatNumber(ballSide)} מ׳`;
  targetValue.textContent = `${formatNumber(targetSide)} מ׳`;
  identityResult.textContent = `m = tan(θ) = ${formatNumber(slope, 3)}`;
}

function getSvgPoint(event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
}

ballGroup.addEventListener("pointerdown", event => {
  dragging = "ball";
  event.preventDefault();
});

targetGroup.addEventListener("pointerdown", event => {
  dragging = "target";
  event.preventDefault();
});

window.addEventListener("pointermove", event => {
  if (!dragging) return;
  const point = getSvgPoint(event);

  if (dragging === "ball") updateBallFromPointer(point);
  if (dragging === "target") updateTargetFromPointer(point);

  updateScene();
});

window.addEventListener("pointerup", () => {
  dragging = null;
});

function updateBallFromPointer(point) {
  const minimumBallY = distanceToSvgY(minimumDistance);
  const maximumBallY = distanceToSvgY(maximumDistance);
  const limitedY = Math.min(maximumBallY, Math.max(minimumBallY, point.y));

  const minimumBallX = sideToSvgX(-maximumBallSide);
  const maximumBallX = sideToSvgX(maximumBallSide);
  const limitedX = Math.min(maximumBallX, Math.max(minimumBallX, point.x));

  const distance = svgYToDistance(limitedY);
  const side = svgXToSide(limitedX);

  distanceSlider.value = Math.round(distance);
  ballSideSlider.value = Math.round(side * 2) / 2;
}

function updateTargetFromPointer(point) {
  const minimumTargetX = sideToSvgX(-halfGoalWidth);
  const maximumTargetX = sideToSvgX(halfGoalWidth);
  const limitedX = Math.min(maximumTargetX, Math.max(minimumTargetX, point.x));

  let target = Math.round(svgXToSide(limitedX) * 100) / 100;
  if (Math.abs(target) < 0.005) target = 0;

  targetSlider.value = target;
}

function animateKick() {
  if (animationFrame) cancelAnimationFrame(animationFrame);

  const startX = Number(shotLine.getAttribute("x1"));
  const startY = Number(shotLine.getAttribute("y1"));
  const endX = Number(shotLine.getAttribute("x2"));
  const endY = Number(shotLine.getAttribute("y2"));

  const duration = 1150;
  const startTime = performance.now();
  movingBall.setAttribute("visibility", "visible");

  function move(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const x = startX + (endX - startX) * eased;
    const y = startY + (endY - startY) * eased;
    const rotation = progress * 720;

    movingBall.setAttribute("transform", `translate(${x}, ${y}) rotate(${rotation})`);

    if (progress < 1) {
      animationFrame = requestAnimationFrame(move);
    } else {
      setTimeout(() => movingBall.setAttribute("visibility", "hidden"), 350);
    }
  }

  animationFrame = requestAnimationFrame(move);
}

distanceSlider.addEventListener("input", updateScene);
ballSideSlider.addEventListener("input", updateScene);
targetSlider.addEventListener("input", updateScene);
kickButton.addEventListener("click", animateKick);

resetButton.addEventListener("click", () => {
  distanceSlider.value = 18;
  ballSideSlider.value = 0;
  targetSlider.value = 0;
  movingBall.setAttribute("visibility", "hidden");
  updateScene();
});

updateScene();
