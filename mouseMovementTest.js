// Testing mouse movements for game /
const canvas = document.querySelector('canvas');
const contex = canvas.getContext('2d');

canvas.width = 600
canvas.height = 600
const paddleHeight = 10;
const paddleWidth = 75;
const paddleX = (canvas.width-paddleWidth)/2;

document.addEventListener("mousemove", mouseMoveHandler, false);

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
      paddleX = relativeX - paddleWidth / 2;
      console.log(e)
    }
  }
  