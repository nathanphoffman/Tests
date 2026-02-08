
  export function loadSprite(fn) {

    let temporaryCanvas = document.createElement("canvas");
    let ctx = temporaryCanvas.getContext("2d");
    temporaryCanvas.width = temporaryCanvas.height = 32;

    let sprites = new Image();
    sprites.crossOrigin = "anonymous"
    sprites.src = 'rogues.png';
    //sprites.onload = getTiles

    function getTile(x, y) {
      ctx.drawImage(sprites, 0, 0, 32, 32, 0, 0, 32, 32);
      console.log(temporaryCanvas.toDataURL("image/png"));
      return temporaryCanvas.toDataURL("image/png");
    }

    sprites.onload = function () {

      var sprite = getTile(2, 1);
      fn(sprite);

    }
  }

  setTimeout(() => {

    loadSprite((imgsrc) => {
      const img = new Image();
      img.src = imgsrc;

      img.onload = function () {
        ctx.drawImage(img, 0, 0, 32, 32); // Adjust the position and size as needed
      }

    });
  }, 1000);
