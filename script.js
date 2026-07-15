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

const goalX = 920;
const goalCenterY = 310;

const metersToPixelsX = 28;
const metersToPixelsY = 20;

const minimumDistance = 8;
const maximumDistance = 22;

let dragging = null;
let animationFrame = null;

function formatNumber(number, decimals = 2) {
  const rounded =
    Math.round(number * 10 ** decimals) / 10 ** decimals;

  if (Math.abs(rounded) < 0.0001) {
    return "0";
  }

  if (Number.isInteger(rounded)) {
    return rounded.toString();
  }

  return rounded
    .toFixed(decimals)
    .replace(/0+$/, "")
    .replace(/\.$/, "");
}

function distanceToSvgX(distance) {
  return goalX - distance * metersToPixelsX;
}

function sideToSvgY(sidePosition) {
  return goalCenterY - sidePosition * metersToPixelsY;
}

function svgYToSide(svgY) {
  return (goalCenterY - svgY) / metersToPixelsY;
}

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function createAngleArcPath(
  centerX,
  centerY,
  radius,
  angleDegrees
) {
  const startAngle = 0;
  const endAngle = -angleDegrees;

  const startX =
    centerX +
    radius * Math.cos(degreesToRadians(startAngle));

  const startY =
    centerY +
    radius * Math.sin(degreesToRadians(startAngle));

  const endX =
    centerX +
    radius * Math.cos(degreesToRadians(endAngle));

  const endY =
    centerY +
    radius * Math.sin(degreesToRadians(endAngle));

  const sweepFlag = angleDegrees >= 0 ? 0 : 1;

  return `
    M ${startX} ${startY}
    A ${radius} ${radius}
    0 0 ${sweepFlag}
    ${endX} ${endY}
  `;
}

function updateScene() {
  const distance = Number(distanceSlider.value);
  const ballSide = Number(ballSideSlider.value);
  const targetSide = Number(targetSlider.value);

  const ballX = distanceToSvgX(distance);
  const ballY = sideToSvgY(ballSide);

  const targetX = goalX;
  const targetY = sideToSvgY(targetSide);

  const deltaX = distance;
  const deltaY = targetSide - ballSide;

  const slope = deltaY / deltaX;
  const angleRadians = Math.atan(slope);
  const angleDegrees = angleRadians * 180 / Math.PI;
  const tangent = Math.tan(angleRadians);

  const pathLength = Math.sqrt(
    deltaX ** 2 + deltaY ** 2
  );

  ballGroup.setAttribute(
    "transform",
    `translate(${ballX}, ${ballY})`
  );

  playerImage.setAttribute(
    "x",
    ballX - 118
  );

  playerImage.setAttribute(
    "y",
    ballY - 145
  );

  targetGroup.setAttribute(
    "transform",
    `translate(${targetX}, ${targetY})`
  );

  shotLine.setAttribute("x1", ballX);
  shotLine.setAttribute("y1", ballY);
  shotLine.setAttribute("x2", targetX);
  shotLine.setAttribute("y2", targetY);

  updateAxes(ballX, ballY);
  updateSlopeTriangle(
    ballX,
    ballY,
    targetX,
    targetY,
    deltaX,
    deltaY
  );

  updateAngle(
    ballX,
    ballY,
    angleDegrees
  );

  updateMathematicalDisplay(
    slope,
    angleDegrees,
    tangent,
    pathLength,
    distance,
    ballSide,
    targetSide
  );
}

function updateAxes(ballX, ballY) {
  xAxis.setAttribute("x1", ballX);
  xAxis.setAttribute("y1", ballY);
  xAxis.setAttribute("x2", goalX + 28);
  xAxis.setAttribute("y2", ballY);

  yAxis.setAttribute("x1", ballX);
  yAxis.setAttribute("y1", ballY + 105);
  yAxis.setAttribute("x2", ballX);
  yAxis.setAttribute("y2", ballY - 120);

  xAxisLabel.setAttribute(
    "x",
    goalX + 34
  );

  xAxisLabel.setAttribute(
    "y",
    ballY + 6
  );

  yAxisLabel.setAttribute(
    "x",
    ballX + 10
  );

  yAxisLabel.setAttribute(
    "y",
    ballY - 128
  );

  originLabel.setAttribute(
    "x",
    ballX - 52
  );

  originLabel.setAttribute(
    "y",
    ballY + 31
  );
}

function updateSlopeTriangle(
  ballX,
  ballY,
  targetX,
  targetY,
  deltaX,
  deltaY
) {
  horizontalLeg.setAttribute("x1", ballX);
  horizontalLeg.setAttribute("y1", ballY);
  horizontalLeg.setAttribute("x2", targetX);
  horizontalLeg.setAttribute("y2", ballY);

  verticalLeg.setAttribute("x1", targetX);
  verticalLeg.setAttribute("y1", ballY);
  verticalLeg.setAttribute("x2", targetX);
  verticalLeg.setAttribute("y2", targetY);

  deltaXLabel.setAttribute(
    "x",
    (ballX + targetX) / 2
  );

  deltaXLabel.setAttribute(
    "y",
    ballY + 26
  );

  deltaXLabel.textContent =
    `Δx = ${formatNumber(deltaX)} מ׳`;

  deltaYLabel.setAttribute(
    "x",
    targetX - 72
  );

  deltaYLabel.setAttribute(
    "y",
    (ballY + targetY) / 2
  );

  deltaYLabel.textContent =
    `Δy = ${formatNumber(deltaY)} מ׳`;

  const isAlmostZero =
    Math.abs(deltaY) < 0.05;

  verticalLeg.style.opacity =
    isAlmostZero ? "0" : "1";

  deltaYLabel.style.opacity =
    isAlmostZero ? "0" : "1";
}

function updateAngle(
  ballX,
  ballY,
  angleDegrees
) {
  const radius = 54;

  if (Math.abs(angleDegrees) < 0.2) {
    angleArc.setAttribute("d", "");
    angleLabel.style.opacity = "0";
    return;
  }

  angleLabel.style.opacity = "1";

  angleArc.setAttribute(
    "d",
    createAngleArcPath(
      ballX,
      ballY,
      radius,
      angleDegrees
    )
  );

  const middleAngle =
    -angleDegrees / 2;

  const labelX =
    ballX +
    72 *
    Math.cos(
      degreesToRadians(middleAngle)
    );

  const labelY =
    ballY +
    72 *
    Math.sin(
      degreesToRadians(middleAngle)
    );

  angleLabel.setAttribute("x", labelX);
  angleLabel.setAttribute("y", labelY);
  angleLabel.textContent = "θ";
}

function updateMathematicalDisplay(
  slope,
  angleDegrees,
  tangent,
  pathLength,
  distance,
  ballSide,
  targetSide
) {
  equationDisplay.textContent =
    Math.abs(slope) < 0.0001
      ? "y = 0"
      : `y = ${formatNumber(slope, 3)}x`;

  let explanation =
    "הכדור נע ישר קדימה אל מרכז השער.";

  if (slope > 0.001) {
    explanation =
      "השיפוע חיובי: מסלול הכדור פונה לצד אחד של השער.";
  }

  if (slope < -0.001) {
    explanation =
      "השיפוע שלילי: מסלול הכדור פונה לצד השני של השער.";
  }

  equationExplanation.textContent =
    explanation;

  slopeValue.textContent =
    formatNumber(slope, 3);

  angleValue.textContent =
    `${formatNumber(angleDegrees, 2)}°`;

  tangentValue.textContent =
    formatNumber(tangent, 3);

  pathLengthValue.textContent =
    `${formatNumber(pathLength, 2)} מ׳`;

  distanceValue.textContent =
    `${formatNumber(distance)} מ׳`;

  ballSideValue.textContent =
    `${formatNumber(ballSide)} מ׳`;

  targetValue.textContent =
    `${formatNumber(targetSide)} מ׳`;

  const difference =
    Math.abs(slope - tangent);

  if (difference < 0.0001) {
    identityResult.textContent =
      `m = tan(θ) = ${formatNumber(slope, 3)}`;

    identityResult.style.background =
      "#dcfce7";

    identityResult.style.color =
      "#15803d";

    identityResult.style.borderColor =
      "#86efac";
  } else {
    identityResult.textContent =
      "בדיקת הקשר...";

    identityResult.style.background =
      "#fef3c7";

    identityResult.style.color =
      "#92400e";

    identityResult.style.borderColor =
      "#fcd34d";
  }
}

function getSvgPoint(event) {
  const point = svg.createSVGPoint();

  point.x = event.clientX;
  point.y = event.clientY;

  return point.matrixTransform(
    svg.getScreenCTM().inverse()
  );
}

ballGroup.addEventListener(
  "pointerdown",
  event => {
    dragging = "ball";
    event.preventDefault();
  }
);

targetGroup.addEventListener(
  "pointerdown",
  event => {
    dragging = "target";
    event.preventDefault();
  }
);

window.addEventListener(
  "pointermove",
  event => {
    if (!dragging) {
      return;
    }

    const point =
      getSvgPoint(event);

    if (dragging === "ball") {
      updateBallFromPointer(point);
    }

    if (dragging === "target") {
      updateTargetFromPointer(point);
    }

    updateScene();
  }
);

window.addEventListener(
  "pointerup",
  () => {
    dragging = null;
  }
);

function updateBallFromPointer(point) {
  const minimumBallX =
    goalX -
    maximumDistance *
    metersToPixelsX;

  const maximumBallX =
    goalX -
    minimumDistance *
    metersToPixelsX;

  const limitedX =
    Math.min(
      maximumBallX,
      Math.max(
        minimumBallX,
        point.x
      )
    );

  const minimumBallY =
    sideToSvgY(10);

  const maximumBallY =
    sideToSvgY(-10);

  const limitedY =
    Math.min(
      maximumBallY,
      Math.max(
        minimumBallY,
        point.y
      )
    );

  const distance =
    (goalX - limitedX) /
    metersToPixelsX;

  const side =
    svgYToSide(limitedY);

  distanceSlider.value =
    Math.round(distance);

  ballSideSlider.value =
    Math.round(side * 2) / 2;
}

function updateTargetFromPointer(point) {
  const minimumTargetY =
    sideToSvgY(3.66);

  const maximumTargetY =
    sideToSvgY(-3.66);

  const limitedY =
    Math.min(
      maximumTargetY,
      Math.max(
        minimumTargetY,
        point.y
      )
    );

  targetSlider.value =
    Math.round(
      svgYToSide(limitedY) * 10
    ) / 10;
}

function animateKick() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }

  const startX =
    Number(
      shotLine.getAttribute("x1")
    );

  const startY =
    Number(
      shotLine.getAttribute("y1")
    );

  const endX =
    Number(
      shotLine.getAttribute("x2")
    );

  const endY =
    Number(
      shotLine.getAttribute("y2")
    );

  const duration = 1150;
  const startTime = performance.now();

  movingBall.setAttribute(
    "visibility",
    "visible"
  );

  function move(currentTime) {
    const progress =
      Math.min(
        (currentTime - startTime) /
        duration,
        1
      );

    const eased =
      1 -
      Math.pow(
        1 - progress,
        3
      );

    const x =
      startX +
      (endX - startX) *
      eased;

    const y =
      startY +
      (endY - startY) *
      eased;

    const rotation =
      progress * 720;

    movingBall.setAttribute(
      "transform",
      `
        translate(${x}, ${y})
        rotate(${rotation})
      `
    );

    if (progress < 1) {
      animationFrame =
        requestAnimationFrame(move);
    } else {
      setTimeout(
        () => {
          movingBall.setAttribute(
            "visibility",
            "hidden"
          );
        },
        350
      );
    }
  }

  animationFrame =
    requestAnimationFrame(move);
}

distanceSlider.addEventListener(
  "input",
  updateScene
);

ballSideSlider.addEventListener(
  "input",
  updateScene
);

targetSlider.addEventListener(
  "input",
  updateScene
);

kickButton.addEventListener(
  "click",
  animateKick
);

resetButton.addEventListener(
  "click",
  () => {
    distanceSlider.value = 18;
    ballSideSlider.value = 0;
    targetSlider.value = 0;

    movingBall.setAttribute(
      "visibility",
      "hidden"
    );

    updateScene();
  }
);

updateScene();
