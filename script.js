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

const deltaXLeg = document.getElementById("deltaXLeg");
const deltaYLeg = document.getElementById("deltaYLeg");
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

/*
  מערכת קואורדינטות:
  x לרוחב המגרש.
  y לאורך המגרש, כאשר כיוון השער הוא y חיובי.
  ראשית הצירים נמצאת במיקום הכדור.
*/

const PIXELS_PER_METER = 12;
const GOAL_LINE_Y = 40;
const FIELD_CENTER_X = 478;

const MIN_DISTANCE = 8;
const MAX_DISTANCE = 22;
const MAX_BALL_SIDE = 10;
const HALF_GOAL_WIDTH = 3.66;

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

function distanceToSvgY(distance) {
  return GOAL_LINE_Y + distance * PIXELS_PER_METER;
}

function sideToSvgX(sidePosition) {
  return FIELD_CENTER_X + sidePosition * PIXELS_PER_METER;
}

function svgXToSide(svgX) {
  return (svgX - FIELD_CENTER_X) / PIXELS_PER_METER;
}

function svgYToDistance(svgY) {
  return (svgY - GOAL_LINE_Y) / PIXELS_PER_METER;
}

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function normalizeAngle(angleDegrees) {
  let angle = angleDegrees;

  while (angle < 0) {
    angle += 360;
  }

  while (angle >= 360) {
    angle -= 360;
  }

  return angle;
}

function createAngleArcPath(
  centerX,
  centerY,
  radius,
  angleDegrees
) {
  const startAngle = 0;
  const endAngle = angleDegrees;

  const startX =
    centerX +
    radius *
    Math.cos(
      degreesToRadians(startAngle)
    );

  const startY =
    centerY -
    radius *
    Math.sin(
      degreesToRadians(startAngle)
    );

  const endX =
    centerX +
    radius *
    Math.cos(
      degreesToRadians(endAngle)
    );

  const endY =
    centerY -
    radius *
    Math.sin(
      degreesToRadians(endAngle)
    );

  const largeArcFlag =
    angleDegrees > 180 ? 1 : 0;

  const sweepFlag = 0;

  return `
    M ${startX} ${startY}
    A ${radius} ${radius}
    0 ${largeArcFlag} ${sweepFlag}
    ${endX} ${endY}
  `;
}

function updateScene() {
  const distance =
    Number(distanceSlider.value);

  const ballSide =
    Number(ballSideSlider.value);

  const targetSide =
    Number(targetSlider.value);

  const ballX =
    sideToSvgX(ballSide);

  const ballY =
    distanceToSvgY(distance);

  const targetX =
    sideToSvgX(targetSide);

  const targetY =
    GOAL_LINE_Y;

  /*
    במערכת המקומית שמרכזה בכדור:
    Δx הוא שינוי לרוחב.
    Δy הוא שינוי לאורך, לכיוון השער.
  */

  let deltaX =
    targetSide - ballSide;

  const deltaY =
    distance;

  if (Math.abs(deltaX) < 0.005) {
    deltaX = 0;
  }

  const isVertical =
    deltaX === 0;

  const slope =
    isVertical
      ? null
      : deltaY / deltaX;

  const angleRadians =
    Math.atan2(
      deltaY,
      deltaX
    );

  const angleDegrees =
    normalizeAngle(
      angleRadians *
      180 /
      Math.PI
    );

  const tangent =
    isVertical
      ? null
      : Math.tan(angleRadians);

  const pathLength =
    Math.sqrt(
      deltaX ** 2 +
      deltaY ** 2
    );

  ballGroup.setAttribute(
    "transform",
    `translate(${ballX}, ${ballY})`
  );

  playerImage.setAttribute(
    "x",
    ballX - 46
  );

  playerImage.setAttribute(
    "y",
    ballY + 12
  );

  targetGroup.setAttribute(
    "transform",
    `translate(${targetX}, ${targetY})`
  );

  shotLine.setAttribute(
    "x1",
    ballX
  );

  shotLine.setAttribute(
    "y1",
    ballY
  );

  shotLine.setAttribute(
    "x2",
    targetX
  );

  shotLine.setAttribute(
    "y2",
    targetY
  );

  updateAxes(
    ballX,
    ballY
  );

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
    deltaX,
    deltaY,
    slope,
    angleDegrees,
    tangent,
    pathLength,
    distance,
    ballSide,
    targetSide,
    isVertical
  );
}

function updateAxes(
  ballX,
  ballY
) {
  /*
    ציר x חיובי ימינה.
    ציר y חיובי כלפי השער.
  */

  xAxis.setAttribute(
    "x1",
    ballX - 110
  );

  xAxis.setAttribute(
    "y1",
    ballY
  );

  xAxis.setAttribute(
    "x2",
    ballX + 135
  );

  xAxis.setAttribute(
    "y2",
    ballY
  );

  yAxis.setAttribute(
    "x1",
    ballX
  );

  yAxis.setAttribute(
    "y1",
    ballY + 80
  );

  yAxis.setAttribute(
    "x2",
    ballX
  );

  yAxis.setAttribute(
    "y2",
    Math.max(
      GOAL_LINE_Y + 10,
      ballY - 145
    )
  );

  xAxisLabel.setAttribute(
    "x",
    ballX + 142
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
    Math.max(
      GOAL_LINE_Y + 26,
      ballY - 150
    )
  );

  originLabel.setAttribute(
    "x",
    ballX + 10
  );

  originLabel.setAttribute(
    "y",
    ballY + 28
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
  /*
    תחילה נעים Δx לרוחב,
    ואז Δy לכיוון השער.
  */

  deltaXLeg.setAttribute(
    "x1",
    ballX
  );

  deltaXLeg.setAttribute(
    "y1",
    ballY
  );

  deltaXLeg.setAttribute(
    "x2",
    targetX
  );

  deltaXLeg.setAttribute(
    "y2",
    ballY
  );

  deltaYLeg.setAttribute(
    "x1",
    targetX
  );

  deltaYLeg.setAttribute(
    "y1",
    ballY
  );

  deltaYLeg.setAttribute(
    "x2",
    targetX
  );

  deltaYLeg.setAttribute(
    "y2",
    targetY
  );

  deltaXLabel.setAttribute(
    "x",
    (ballX + targetX) / 2
  );

  deltaXLabel.setAttribute(
    "y",
    ballY + 25
  );

  deltaXLabel.setAttribute(
    "text-anchor",
    "middle"
  );

  deltaXLabel.textContent =
    `Δx = ${formatNumber(deltaX)} מ׳`;

  deltaYLabel.setAttribute(
    "x",
    targetX + 12
  );

  deltaYLabel.setAttribute(
    "y",
    (ballY + targetY) / 2
  );

  deltaYLabel.textContent =
    `Δy = ${formatNumber(deltaY)} מ׳`;

  const isVertical =
    Math.abs(deltaX) < 0.005;

  deltaXLeg.style.opacity =
    isVertical ? "0" : "1";

  deltaXLabel.style.opacity =
    isVertical ? "0" : "1";
}

function updateAngle(
  ballX,
  ballY,
  angleDegrees
) {
  const radius = 48;

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
    angleDegrees / 2;

  const labelX =
    ballX +
    66 *
    Math.cos(
      degreesToRadians(
        middleAngle
      )
    );

  const labelY =
    ballY -
    66 *
    Math.sin(
      degreesToRadians(
        middleAngle
      )
    );

  angleLabel.setAttribute(
    "x",
    labelX
  );

  angleLabel.setAttribute(
    "y",
    labelY
  );

  angleLabel.textContent = "θ";
}

function updateMathematicalDisplay(
  deltaX,
  deltaY,
  slope,
  angleDegrees,
  tangent,
  pathLength,
  distance,
  ballSide,
  targetSide,
  isVertical
) {
  if (isVertical) {
    equationDisplay.textContent =
      "x = 0";

    equationExplanation.textContent =
      "בעיטה ישרה למרכז השער היא ישר אנכי.";

    slopeValue.textContent =
      "לא מוגדר";

    tangentValue.textContent =
      "לא מוגדר";

    identityResult.textContent =
      "בישר אנכי: Δx = 0 ולכן השיפוע אינו מוגדר";

    identityResult.classList.add(
      "undefined"
    );
  } else {
    const intercept =
      -slope * 0;

    equationDisplay.textContent =
      `y = ${formatNumber(slope, 3)}x`;

    equationExplanation.textContent =
      slope > 0
        ? "השיפוע חיובי."
        : "השיפוע שלילי.";

    slopeValue.textContent =
      formatNumber(
        slope,
        3
      );

    tangentValue.textContent =
      formatNumber(
        tangent,
        3
      );

    identityResult.textContent =
      `m = tan(θ) = ${formatNumber(slope, 3)}`;

    identityResult.classList.remove(
      "undefined"
    );
  }

  angleValue.textContent =
    `${formatNumber(angleDegrees, 2)}°`;

  pathLengthValue.textContent =
    `${formatNumber(pathLength, 2)} מ׳`;

  distanceValue.textContent =
    `${formatNumber(distance)} מ׳`;

  ballSideValue.textContent =
    `${formatNumber(ballSide)} מ׳`;

  targetValue.textContent =
    `${formatNumber(targetSide)} מ׳`;
}

function getSvgPoint(event) {
  const point =
    svg.createSVGPoint();

  point.x =
    event.clientX;

  point.y =
    event.clientY;

  return point.matrixTransform(
    svg
      .getScreenCTM()
      .inverse()
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
  const minimumBallY =
    distanceToSvgY(
      MIN_DISTANCE
    );

  const maximumBallY =
    distanceToSvgY(
      MAX_DISTANCE
    );

  const limitedY =
    Math.min(
      maximumBallY,
      Math.max(
        minimumBallY,
        point.y
      )
    );

  const minimumBallX =
    sideToSvgX(
      -MAX_BALL_SIDE
    );

  const maximumBallX =
    sideToSvgX(
      MAX_BALL_SIDE
    );

  const limitedX =
    Math.min(
      maximumBallX,
      Math.max(
        minimumBallX,
        point.x
      )
    );

  const distance =
    svgYToDistance(
      limitedY
    );

  const side =
    svgXToSide(
      limitedX
    );

  distanceSlider.value =
    Math.round(distance);

  ballSideSlider.value =
    Math.round(
      side * 2
    ) / 2;
}

function updateTargetFromPointer(point) {
  const minimumTargetX =
    sideToSvgX(
      -HALF_GOAL_WIDTH
    );

  const maximumTargetX =
    sideToSvgX(
      HALF_GOAL_WIDTH
    );

  const limitedX =
    Math.min(
      maximumTargetX,
      Math.max(
        minimumTargetX,
        point.x
      )
    );

  let target =
    Math.round(
      svgXToSide(limitedX) *
      100
    ) / 100;

  if (Math.abs(target) < 0.005) {
    target = 0;
  }

  targetSlider.value =
    target;
}

function animateKick() {
  if (animationFrame) {
    cancelAnimationFrame(
      animationFrame
    );
  }

  const startX =
    Number(
      shotLine.getAttribute(
        "x1"
      )
    );

  const startY =
    Number(
      shotLine.getAttribute(
        "y1"
      )
    );

  const endX =
    Number(
      shotLine.getAttribute(
        "x2"
      )
    );

  const endY =
    Number(
      shotLine.getAttribute(
        "y2"
      )
    );

  const duration = 1150;
  const startTime =
    performance.now();

  movingBall.setAttribute(
    "visibility",
    "visible"
  );

  function move(currentTime) {
    const progress =
      Math.min(
        (
          currentTime -
          startTime
        ) /
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
      (
        endX -
        startX
      ) *
      eased;

    const y =
      startY +
      (
        endY -
        startY
      ) *
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
        requestAnimationFrame(
          move
        );
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
    requestAnimationFrame(
      move
    );
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
