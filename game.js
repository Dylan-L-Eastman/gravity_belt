// (function () {
  let gameArea;

  // create game area
  gameArea = {
    canvas : document.getElementById('game'),
    clear : function() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    objects: {
      players: [],
      rocks: [],
    },
    ticks: 0,
    start : function() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.ctx = this.canvas.getContext("2d");
      loadGame();
      this.frameNo = 0;
      this.interval = setInterval(updateGame, 20);
    },
    stop : function() {
      clearInterval(this.interval);
      showPause(gameArea.canvas);
    },
  }

  // Player class
  class Player {
    constructor(args) {
      this.dx = args.dx || 0;
      this.dy = args.dy || 0;
      this.mass = args.mass || 20;
      this.size = args.size || 20;
      this.thrusterBottom = false;
      this.thrusterLeft = false;
      this.thrusterRight = false;
      this.thrusterTop = false;
      this.h = args.h || this.size;
      this.w = args.w || this.size;
      this.x = args.x || gameArea.canvas.width/2;
      this.y = args.y || gameArea.canvas.height/2;
    }

    draw() {
      let ctx = gameArea.ctx;
      // first save the untranslated/unrotated context
      ctx.save();
      ctx.beginPath();
      // move the rotation point to the center of the rect
      ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
      // rotate the rect
      ctx.rotate(78 * Math.PI / 180);
      // draw the rect on the transformed context
      // Note: after transforming [0,0] is visually [x,y]
      //       so the rect needs to be offset accordingly when drawn
      ctx.rect(-this.w / 2, -this.h / 2, this.w, this.h);
      ctx.fillStyle = "black";
      ctx.fill();
      // restore the context to its untranslated/unrotated state
      ctx.restore();
    }

    moveTowards(target) {
      var distance = Math.sqrt(Math.pow((target.x-this.x),2)+Math.pow((target.y-this.y),2))
      var force = calcForce(target.mass, this.mass, distance)

      if (this.x < target.x) {
        this.dx += force;
      } else if (this.x > target.x) {
        this.dx -= force;
      }
      if (this.y < target.y) {
        this.dy += force;
      } else if (this.y > target.y) {
        this.dy -= force;
      }

      if (!rectCircleColliding(target, this)) { // move player if NO collision
        this.x += this.dx;
        this.y += this.dy;
      }

    }

    update() {

    }
  }

  // Rock Class
  class Rock {
    constructor(args) {
      this.mass = args.mass || 50;
      this.dx = args.dx || 0;
      this.dy = args.dy || 0;
      this.r = args.r || 25;
      this.stationary = args.stationary || false;
      this.x = args.x || gameArea.canvas.width/2;
      this.y = args.y || gameArea.canvas.height/2;
    }

    draw() {
      let ctx = gameArea.ctx;
      ctx.save();
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(this.x,this.y,this.r,0,2*Math.PI);
      ctx.stroke();
      ctx.restore();
    }

    //--------------------------------------------------------------------------
    // Gravity Equation:
    //--------------------------------------------------------------------------
    // F = Gm1m2/r2,
    // where F is the force due to gravity, between two masses (m1 and m2),
    // which are a distance r apart; G is the gravitational constant.
    // G (on Earth) = 6.67428e-11
    //--------------------------------------------------------------------------
    moveTowards(target) {
      var distance = Math.sqrt(Math.pow((target.x-this.x),2)+Math.pow((target.y-this.y),2))
      var force = calcForce(target.mass, this.mass, distance)

      if (this.x < target.x) {
        this.dx += force;
      } else if (this.x > target.x) {
        this.dx -= force;
      }
      if (this.y < target.y) {
        this.dy += force;
      } else if (this.y > target.y) {
        this.dy -= force;
      }

      if (!rockCollide(this, target)) { // move rock if NO collision
        this.x += this.dx;
        this.y += this.dy;
      } else { // remove rock from game if collision
        gameArea.objects.rocks.forEach(function(rock) {
          if (this == rock) {
            gameArea.objects.rocks.splice(gameArea.objects.rocks.indexOf(this), 1);
          }
        }, this)
      }

    }
  }


  // load game
  function loadGame() {
    let mainRock = new Rock({
      stationary: true,
    });

    gameArea.objects.rocks.push(mainRock);

    for (i=0; i<4; i++) {
      gameArea.objects.rocks.push(makeRandRock());
    }

    let player = new Player({
      x: 50,
      y: 50,
    });
    gameArea.objects.players.push(player);
  }

  // update game
  function updateGame() {
    gameArea.clear();

    let stationaryRock;

    // get stationaryRock object
    gameArea.objects.rocks.forEach(function(rock) {
      if (rock.stationary) {
        stationaryRock = rock;
      }
    })
    // move rocks towards stationaryRock
    gameArea.objects.players.forEach(function(player) {
      player.moveTowards(stationaryRock);
    })
    // gameArea.objects.rocks.forEach(function(rock) {
    //   if (!rock.stationary) { // if rock is moving
    //     // move towards stationary rock (only 1 stationary at this time)
    //     rock.moveTowards(stationaryRock);
    //   }
    // })

    // draw game objects
    gameArea.objects.rocks.forEach(function(rock) {
      rock.draw();
    })



    gameArea.objects.players.forEach(function(player) {
      player.draw();
    })
  };

  function calcForce(m1, m2, distance) {
    return ((6.67*m1*m2)/(distance*distance))
  }

  function rockCollide(r1, r2) {
    var dx = r1.x - r2.x;
    var dy = r1.y - r2.y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < r1.r + r2.r) {
        return true
    } else {
      return false
    }
  }

  // return true if the rectangle and circle are colliding
  function rectCircleColliding(circle,rect){
      var distX = Math.abs(circle.x - rect.x-rect.w/2);
      var distY = Math.abs(circle.y - rect.y-rect.h/2);

      if (distX > (rect.w/2 + circle.r)) { return false; }
      if (distY > (rect.h/2 + circle.r)) { return false; }

      if (distX <= (rect.w/2)) { return true; }
      if (distY <= (rect.h/2)) { return true; }

      var dx=distX-rect.w/2;
      var dy=distY-rect.h/2;
      return (dx*dx+dy*dy<=(circle.r*circle.r));
  }

  function getRandInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
  }

  function makeRandRock() {
    return(
        new Rock({
          x: getRandInt(0, gameArea.canvas.width),
          y: getRandInt(0, gameArea.canvas.height),
          r: 10,
          mass: getRandInt(2,30),
        })
    )
  }

  window.onload = gameArea.start(); // start the game loop
  // return game = gameArea; // return gameArea object (testing)
// })();


//------------------------------------------------------------------------------
//                            EVENT LISTENERS

document.onkeydown = checkKeyDown;
// document.onkeyup = checkKeyUp;

function checkKeyDown(e) {
    e = e || window.event;
    let player = gameArea.objects.players[0];

  switch (e.keyCode) {
    case 13:
      if (can_restart) {
        location.reload();
      };
      break;
    case 38:
    case 87:
      // console.log('up');
      player.thrusterUp = true;
      break;
    case 40:
    case 83:
      // console.log('down');
      player.thrusterDown = true;
      break;
    case 37:
    case 65:
      player.thrusterLeft = true;
      // console.log('left');
      break;
    case 39:
    case 68:
      player.thrusterRight = true;
      // console.log('right');
      break;
  }
}
