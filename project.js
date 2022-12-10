// graphics project 기능 개선 및 추가한 그림판 - project.js
// 과목: 컴퓨터 그래픽스
// 분반: 1분반
// 학번: 32203928
// 학과: 소프트웨어학과
// 이름: 장현정

let gl;
const maxNumTriangles = 600;
const maxNumVertices = 3 * maxNumTriangles;

let index = 0; // 선, 삼각형 그림의 정점들을 저장할 인덱스
let colorIndex = 0; // 입력받은 색상의 value 값 저장할 변수. color 배열과 매칭
let shapeIndex = ""; // 그리고자 하는 모양들의 value 값을 저장. string 타입이어서 빈 문자열로 초기화
let bgIndex = 0; // 캔버스 배경 색상의 value를 저장할 인덱스
let sizeIndex = 0; // 캔버스 크기 값을 저장할 인덱스

// 사각형 그림에 필요한 변수 선언 및 초기화
let recIndex = 0;
let first = true;
let t1 = 0;
let t2 = 0;
let t3 = 0;
let t4 = 0;

let draw = false; // 마우스의 상태 저장할 변수

const colors = [
  vec4(1.0, 0.0, 0.0, 1.0), // red
  vec4(1.0, 0.5, 0.0, 1.0), // orange
  vec4(1.0, 1.0, 0.0, 1.0), // yellow
  vec4(0.0, 1.0, 0.0, 1.0), // green
  vec4(0.0, 0.0, 1.0, 1.0), // blue
  vec4(1.0, 0.0, 1.0, 1.0), // purple
  vec4(1.0, 1.0, 1.0, 1.0), // white
  vec4(0.0, 0.0, 0.0, 1.0), // black
];

window.onload = function init() {
  const canvas = document.getElementById("canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  // 그림이 그려질 색상의 버튼이 클릭되었을 때, 해당 버튼의 value 값을 colorIndex에 대입
  const colorBtns = document.getElementsByClassName("colorBtn");
  Array.from(colorBtns).forEach((colors) =>
    colors.addEventListener("click", (e) => {
      colorIndex = parseInt(e.target.value);
    })
  );

  // canvas 배경 색상의 버튼이 클릭되었을 때, 해당 색상에 맞는 value 값을 가져와 배경 색상 변경
  const bgColor = document.getElementsByClassName("bgBtn");
  Array.from(bgColor).forEach((bg) =>
    bg.addEventListener("click", (e) => {
      bgIndex = parseInt(e.target.value);
      // bgIndex의 값에 따라 canvas 배경 색상 변경
      switch (bgIndex) {
        case 0:
          gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black
          break;
        case 1:
          gl.clearColor(0.5, 0.5, 0.5, 1.0); // Grey
          break;
        case 2:
          gl.clearColor(1.0, 1.0, 1.0, 1.0); // White
          break;
        case 3:
          gl.clearColor(0.0, 0.8, 1.0, 0.5); // LightBlue
          break;
        case 4:
          gl.clearColor(1.0, 1.0, 0.0, 0.5); // LightYellow
          break;
        case 5:
          gl.clearColor(1.0, 0.0, 0.0, 0.5); // LightPink
          break;
        case 6:
          gl.clearColor(0.0, 1.0, 0.0, 0.7); // LightGreen
          break;
      }
    })
  );

  // 어떤 그림이 선택되었는지 value 값 가져와 shapeIndex에 저장하는 과정
  const drawingShape = document.getElementsByClassName("shape");
  Array.from(drawingShape).forEach((shape) =>
    shape.addEventListener("click", (e) => {
      shapeIndex = e.target.value;
    })
  );

  // erase 버튼 클릭하면 그림판의 그림들이 지워짐.
  const eraseBtn = document.getElementById("eraseBtn");
  eraseBtn.onclick = () => {
    gl.clearColor(1.0, 1.0, 1.0, 1.0); // canvas 기본 배경 색상은 white
    index = 0; // index를 0으로 초기화하여 선, 삼각형 그림들 지우기
    recIndex = 0; // 사각형 그림 지우기
  };

  canvas.addEventListener("mousedown", () => {
    draw = true; // 마우스 버튼을 눌렀을 때 draw = true로 바꿔 canvas에 그려지도록 함
  });

  canvas.addEventListener("mousedown", (e) => {
    if (shapeIndex == "rectangle") {
      // 사각형의 정점 얻기
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      if (first) {
        first = false;
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        t1 = vec2(
          (2 * e.clientX) / canvas.width - 1,
          (2 * (canvas.height - e.clientY)) / canvas.height - 1
        );
      } else {
        first = true;
        t2 = vec2(
          (2 * e.clientX) / canvas.width - 1,
          (2 * (canvas.height - e.clientY)) / canvas.height - 1
        );
        t3 = vec2(t1[0], t2[1]);
        t4 = vec2(t2[0], t1[1]);

        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * recIndex, flatten(t1));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (recIndex + 1), flatten(t3));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (recIndex + 2), flatten(t2));
        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (recIndex + 3), flatten(t4));
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        recIndex += 4;

        t = vec4(colors[colorIndex]);

        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (recIndex - 4), flatten(t));
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (recIndex - 3), flatten(t));
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (recIndex - 2), flatten(t));
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (recIndex - 1), flatten(t));
      }
    } else {
      draw = true;
    }
  });

  canvas.addEventListener("mouseup", () => {
    draw = false; // 마우스 버튼을 떼었을 때 draw=false로 바꿔 그림 그리기 멈춤
  });

  // 마우스가 움직였을 때(그림이 그려지고 있을 때) 이벤트 처리
  canvas.addEventListener("mousemove", (e) => {
    if (draw) {
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      let t = vec2(
        (2 * e.clientX) / canvas.width - 1,
        (2 * (canvas.height - e.clientY)) / canvas.height - 1
      );
      gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten(t));

      gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
      t = vec4(colors[colorIndex]);
      gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(t));
      index++;
    }
  });

  // 마우스가 클릭되었을 때 이벤트 처리
  canvas.onclick = (e) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

    let t = vec2(
      (2 * e.clientX) / canvas.width - 1,
      (2 * (canvas.height - e.clientY)) / canvas.height - 1
    );
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten(t));

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    t = vec4(colors[colorIndex]);
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(t));
    index++;
  };

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  // 캔버스 그림판 사이즈 변경. select에서 선택된 값 가져와 해당 값에 따라 캔버스 크기 변경
  const canvasSize = document.getElementById("canvas-size");
  canvasSize.addEventListener("click", () => {
    sizeIndex = canvasSize.selectedIndex;

    switch (sizeIndex) {
      case 0:
        canvas.width = 400;
        canvas.height = 400;
        gl.viewport(0, 0, canvas.width, canvas.height);
        break;
      case 1:
        canvas.width = 550;
        canvas.height = 550;
        gl.viewport(0, 0, canvas.width, canvas.height);
        break;
      case 2:
        canvas.width = 700;
        canvas.height = 700;
        gl.viewport(0, 0, canvas.width, canvas.height);
        break;
      case 3:
        canvas.width = 800;
        canvas.height = 800;
        gl.viewport(0, 0, canvas.width, canvas.height);
        break;
    }
  });

  const program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  const vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumVertices, gl.STATIC_DRAW);

  const vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  const cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW);

  const vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  render();
};

// 그림 그리기 도구 모양 중 하나만 선택되도록 하기 위한 함수
function selectOne(e) {
  document
    .querySelectorAll(`input[type=checkbox]`)
    .forEach((el) => (el.checked = false));
  e.checked = true;
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  if (shapeIndex == "connected") {
    // 하나로 연결된 선 그리기
    gl.drawArrays(gl.LINE_STRIP, 0, index);
  } else if (shapeIndex == "straight") {
    // 직선 등 그리기
    gl.drawArrays(gl.LINES, 0, index);
  } else if (shapeIndex == "dotted") {
    // 점선 그리기
    gl.drawArrays(gl.POINTS, 0, index);
  } else if (shapeIndex == "triangle") {
    // 삼각형 그리기
    gl.drawArrays(gl.TRIANGLES, 0, index);
  } else if (shapeIndex == "rectangle") {
    // 사각형 그리기
    for (let i = 0; i < recIndex; i += 4) {
      gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
    }
  }

  window.requestAnimationFrame(render);
}
