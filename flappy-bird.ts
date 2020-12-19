import { LitElement, css, html, property, customElement } from 'lit-element';

enum GameState {
  SplashScreen = 0,
  GameScreen = 1,
  ScoreScreen = 2
};

enum AnimationState {
  running = 'running',
  paused = 'paused'
};

enum Sound {
  jump = "https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/sounds/sfx_wing.ogg",
  score = "https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/sounds/sfx_point.ogg",
  hit = "https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/sounds/sfx_hit.ogg",
  die = "https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/sounds/sfx_die.ogg",
  swoosh = "https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/sounds/sfx_swooshing.ogg"
}

@customElement('flappy-bird')
export class FlappyBird extends LitElement {

  @property({type: Boolean}) autopilot = false;
  @property({type: Number}) scale = 1;
  @property({type: Number}) height = 525;

  @property({type: Number}) gravity = 0.25;
  @property({type: Number}) velocity = 0;
  @property({type: Number}) position = 240;
  @property({type: Number}) rotation = 0;
  @property({type: Number}) jump = -4.6;
  @property({type: Number}) flyArea = 420;
  @property({type: Number}) volume = 30;
  @property({type: Number}) pipeHeight = 90;
  @property({type: Number}) pipePadding = 80;

  
  @property({type: GameState, attribute: false}) currentstate = GameState.SplashScreen;
  @property({type: Number, attribute: false}) score = 0;
  @property({type: Number, attribute: false}) highscore = 0;
  @property({type: Array, attribute: false}) pipes = new Array();

  @property({type: AnimationState, attribute: false}) cssAnimatedState = AnimationState.running;
  @property({type: String, attribute: false}) cssScoreBoard = "display: none;";
  @property({type: String, attribute: false}) cssPlayer = "";
  @property({type: String, attribute: false}) cssMedal = "";
  @property({type: String, attribute: false}) cssReplay = "";

  pipesIdx = 0;
  loopGameloop;
  loopPipeloop;
  loopAutoPilot;
  
  static get styles() {
    return css`
      @-webkit-keyframes animLand {
        0% { background-position: 0px 0px; }
        100% { background-position: -335px 0px; }
      }
      @-moz-keyframes animLand {
        0% { background-position: 0px 0px; }
        100% { background-position: -335px 0px; }
      }
      @-o-keyframes animLand {
        0% { background-position: 0px 0px; }
        100% { background-position: -335px 0px; }
      }
      @keyframes animLand {
        0% { background-position: 0px 0px; }
        100% { background-position: -335px 0px; }
      }

      @-webkit-keyframes animSky {
        0% { background-position: 0px 100%; }
        100% { background-position: -275px 100%; }
      }
      @-moz-keyframes animSky {
        0% { background-position: 0px 100%; }
        100% { background-position: -275px 100%; }
      }
      @-o-keyframes animSky {
        0% { background-position: 0px 100%; }
        100% { background-position: -275px 100%; }
      }
      @keyframes animSky {
        0% { background-position: 0px 100%; }
        100% { background-position: -275px 100%; }
      }

      @-webkit-keyframes animBird {
        from { background-position: 0px 0px; }
        to { background-position: 0px -96px; }
      }
      @-moz-keyframes animBird {
        from { background-position: 0px 0px; }
        to { background-position: 0px -96px; }
      }
      @-o-keyframes animBird {
        from { background-position: 0px 0px; }
        to { background-position: 0px -96px; }
      }
      @keyframes animBird {
        from { background-position: 0px 0px; }
        to { background-position: 0px -96px; }
      }

      @-webkit-keyframes animPipe {
        0% { left: 460px; }
        100% { left: -100px; }
      }
      @-moz-keyframes animPipe {
        0% { left: 460px; }
        100% { left: -100px; }
      }
      @-o-keyframes animPipe {
        0% { left: 460px; }
        100% { left: -100px; }
      }
      @keyframes animPipe {
        0% { left: 460px; }
        100% { left: -100px; }
      }

      @-webkit-keyframes animCeiling {
        0% { background-position: 0px 0px; }
        100% { background-position: -63px 0px; }
      }
      @-moz-keyframes animCeiling {
        0% { background-position: 0px 0px; }
        100% { background-position: -63px 0px; }
      }
      @-o-keyframes animCeiling {
        0% { background-position: 0px 0px; }
        100% { background-position: -63px 0px; }
      }
      @keyframes animCeiling {
        0% { background-position: 0px 0px; }
        100% { background-position: -63px 0px; }
      }

      *,
      *:before,
      *:after {
        /* border box */
        -moz-box-sizing: border-box;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        /* gpu acceleration */
        -webkit-transition: translate3d(0,0,0);
        /* select disable */
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      #gamecontainer {
        transform-origin: top left;
        -webkit-transform-origin: top left;
        font-family: monospace;
        font-size: 12px;
        color: #fff;
        overflow: hidden;
        position: relative;
        width: 323px;
        height: 100%;
        min-height: 525px;
      }

      /*
      Screen - Game
      */
      #gamescreen {
        position: absolute;
        width: 100%;
        height: 100%;
      }

      #sky {
        position: absolute;
        top: 0;
        width: 100%;
        height: 80%;
        background-image: url('https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/sky.png');
        background-repeat: repeat-x;
        background-position: 0px 100%;
        background-color: #4ec0ca;
        
        -webkit-animation: animSky 7s linear infinite;
        animation: animSky 7s linear infinite;
      }

      #flyarea {
        position: absolute;
        bottom: 0;
        height: 420px;
        width: 100%;
      }

      #ceiling {
        position: absolute;
        top: -16px;
        height: 16px;
        width: 100%;
        background-image: url('https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/ceiling.png');
        background-repeat: repeat-x;
        
        -webkit-animation: animCeiling 481ms linear infinite;
        animation: animCeiling 481ms linear infinite;
      }

      #land {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 20%;
        background-image: url('https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/land.png');
        background-repeat: repeat-x;
        background-position: 0px 0px;
        background-color: #ded895;
        
        -webkit-animation: animLand 2516ms linear infinite;
        animation: animLand 2516ms linear infinite;
      }

      #bigscore {
        position: absolute;
        top: 80px;
        left: 150px;
        z-index: 100;
      }

      #bigscore img {
        display: inline-block;
        padding: 1px;
      }

      #splash {
        position: absolute;
        opacity: 0;
        top: 140px;
        left: 65px;
        width: 188px;
        height: 170px;
        background-image: url('https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/splash.png');
        background-repeat: no-repeat;
      }

      #scoreboard {
        display: none;
        opacity: 0;
        position: absolute;
        top: 300px;
        left: 43px;
        width: 236px;
        height: 280px;
        background-image: url('https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/scoreboard.png');
        background-repeat: no-repeat;
        z-index: 1000;
      }

      #medal {
        position: absolute;
        opacity: 0;
        top: 114px;
        left: 32px;
        width: 44px;
        height: 44px;
        z-index: 999;
        transform: scale(2);
      }

      #currentscore {
        position: absolute;
        top: 105px;
        left: 107px;
        width: 104px;
        height: 14px;
        text-align: right;
      }

      #currentscore img {
        padding-left: 2px;
      }

      #highscore {
        position: absolute;
        top: 147px;
        left: 107px;
        width: 104px;
        height: 14px;
        text-align: right;
      }

      #highscore img {
        padding-left: 2px;
      }

      #replay {
        opacity: 0;
        position: absolute;
        top: 245px;
        left: 61px;
        height: 70px;
        width: 115px;
        cursor: pointer;
      }

      #player {
        z-index: 500;
        left: 80px;
        top: 200px;
      }

      .bird {
        position: absolute;
        width: 34px;
        height: 24px;
        background-image: url('https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/bird.png');
        
        -webkit-animation: animBird 300ms steps(4) infinite;
        animation: animBird 300ms steps(4) infinite;
      }

      .pipe {
        position: absolute;
        left: -100px;
        width: 52px;
        height: 100%;
        z-index: 10;
        
        -webkit-animation: animPipe 4200ms linear;
        animation: animPipe 4200ms linear;
        animation-iteration-count: infinite;
      }

      .pipe_upper {
        position: absolute;
        top: 0;
        width: 52px;
        background-image: url('https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/pipe.png');
        background-repeat: repeat-y;
        background-position: center;
      }

      .pipe_upper:after {
        content: "";
        position: absolute;
        bottom: 0;
        width: 52px;
        height: 26px;
        background-image: url('https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/pipe-down.png');
      }

      .pipe_lower {
        position: absolute;
        bottom: 0;
        width: 52px;
        background-image: url('https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/pipe.png');
        background-repeat: repeat-y;
        background-position: center;
      }

      .pipe_lower:after {
        content: "";
        position: absolute;
        top: 0;
        width: 52px;
        height: 26px;
        background-image: url('https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/pipe-up.png');
      }

      #footer {
        position: absolute;
        bottom: 3px;
        left: 3px;
      }

      #footer a,
      #footer a:link,
      #footer a:visited,
      #footer a:hover,
      #footer a:active {
        display: block;
        padding: 2px;
        text-decoration: none;
        color: #fff;
      }`;
  }

  render() {
    return html`
      <div id="gamecontainer" @click="${this.screenClick}" style="height: ${this.height}px; transform: scale(${this.scale});">
        <div id="gamescreen">
          <div id="sky" class="animated" style="animation-play-state: ${this.cssAnimatedState}; -webkit-animation-play-state: ${this.cssAnimatedState};">
            <div id="flyarea">
              <div id="ceiling" class="animated" style="animation-play-state: ${this.cssAnimatedState}; -webkit-animation-play-state: ${this.cssAnimatedState};"></div>
              <!-- This is the flying and pipe area container -->
              <div
                id="player"
                class="bird animated"
                style="top: ${this.position}px; transform: rotate(${this.rotation}deg); animation-play-state: ${this.cssAnimatedState}; -webkit-animation-play-state: ${this.cssAnimatedState}; ${this.cssPlayer}"
              ></div>
              
              <div id="bigscore" style=${this.currentstate !== GameState.ScoreScreen ? "" : "display: none;"}>
                ${this.score.toString().split("").map(i => html`<img src='https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/font_big_${i}.png' alt='${i}'/>`)}
              </div>

              <div id="splash" style="opacity: ${this.currentstate === GameState.SplashScreen ? 1 : 0}; transition: opacity 0.5s ease-in-out"></div>
                
              <div id="scoreboard" style="${this.cssScoreBoard}">
                <div id="medal" style="${this.cssMedal}">
                  ${
                    this.score >= 40 ? html`<img src="https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/medal_platinum.png" alt="platinum">` :
                    this.score >= 30 ? html`<img src="https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/medal_gold.png" alt="gold">` :
                    this.score >= 20 ? html`<img src="https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/medal_silver.png" alt="silver">` :
                    this.score >= 10 ? html`<img src="https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/medal_bronze.png" alt="bronze">` :
                    null
                  }
                </div>
                <div id="currentscore">
                  ${this.score.toString().split("").map(i => html`<img src='https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/font_small_${i}.png' alt='${i}'/>`)}
                </div>
                <div id="highscore">
                  ${this.highscore.toString().split("").map(i => html`<img src='https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/font_small_${i}.png' alt='${i}'/>`)}
                </div>
                <div id="replay" @click="${this.replayClick}" style="${this.cssReplay}"><img src="https://raw.githubusercontent.com/35niavlys/flappybird/master/assets/replay.png" alt="replay"/></div>
              </div>
              
              <!-- Pipes go here! -->
              ${this.pipes.map(p => html`<div class="pipe animated" style="animation-play-state: ${this.cssAnimatedState}; -webkit-animation-play-state: ${this.cssAnimatedState};"><div class="pipe_upper" style="height: ${p.topheight}px;"></div><div class="pipe_lower" style="height: ${p.bottomheight}px;"></div></div>`)}
            </div>
          </div>
          <div id="land" class="animated" style="animation-play-state: ${this.cssAnimatedState}; -webkit-animation-play-state: ${this.cssAnimatedState};"></div>
        </div>
        <div id="footer">
          <input type="checkbox" ?checked=${this.autopilot} @click="${this.toggleAutopilot}">autopilot</input>
          <a href="https://github.com/35niavlys/flappybird">view github project</a>
        </div>
      </div>`
  }

  connectedCallback() {
    super.connectedCallback();

    let savedscore = FlappyBird.getCookie("highscore");
    if(savedscore)
      this.highscore = parseInt(savedscore);

    FlappyBird.showSplash(this);
    var self = this;
    document.addEventListener('keydown', function(e: KeyboardEvent) {
      if(e.code == 'Space') {
        if(self.currentstate === GameState.ScoreScreen)
          self.replayClick();
        else
          self.screenClick();
      }
    });
    
    //Handle mouse down OR touch start
    let eventName = "ontouchstart" in window ? "touchstart" : "mousedown";
    document.addEventListener(eventName, self.screenClick);
  }

  screenClick() {
    if(this.currentstate === GameState.GameScreen)
        FlappyBird.playerJump(this);
    else if(this.currentstate === GameState.SplashScreen)
        FlappyBird.startGame(this);
  }

  toggleAutopilot() {
    this.autopilot = !this.autopilot;
  }

  private replayClick() {
    let self = this;
    this.cssScoreBoard = "display: block; opacity: 0; top: -100px; transition: all 0.6s ease-in;";
    setTimeout(function() {
      self.cssScoreBoard = "";
    }, 600);
    FlappyBird.showSplash(this);
  }

  private static showSplash(self: FlappyBird) {
    
    //set the defaults (again)
    self.velocity = 0;
    self.position = 240;
    self.rotation = 0;
    self.score = 0;
    self.cssPlayer = "";
    //clear out all the pipes if there are any
    self.pipes = new Array();
    
    //make everything animated again
    self.cssAnimatedState = AnimationState.running;
    
    //differ change to avoid multi click events problem
    setTimeout(function() {self.currentstate = GameState.SplashScreen;});
    
    FlappyBird.play(self, Sound.swoosh);
  }

  private static startGame(self: FlappyBird) {
    
    self.currentstate = GameState.GameScreen;

    //start up our loops
    //60 times a second
    let updateRate = 1000 / 60;
    self.loopGameloop = setInterval(FlappyBird.gameLoop, updateRate, self);
    self.loopPipeloop = setInterval(FlappyBird.updatePipes, 1400, self);
    if(self.autopilot)
      self.loopAutoPilot = setInterval(FlappyBird.autopilot, 20, self);
    
    //jump from the start!
    FlappyBird.playerJump(self);
  }

  private static gameLoop(self: FlappyBird) {
    
    //update the player speed/position
    self.velocity += self.gravity;
    self.position += self.velocity;
    
    //update the player rotation
    self.rotation = Math.min((self.velocity / 10) * 90, 90);
    
    //create the bounding box
    let box = self.shadowRoot.getElementById('player').getBoundingClientRect();
    
    let origwidth = 24.0;
    let origheight = 24.0;
    
    let boxwidth = origwidth - (Math.sin(Math.abs(self.rotation) / 90) * 8);
    let boxheight = (origheight + box.height) / 2;
    let boxleft = ((box.width - boxwidth) / 2) + box.left;
    let boxtop = ((box.height - boxheight) / 2) + box.top;
    let boxright = boxleft + boxwidth;
    let boxbottom = boxtop + boxheight;
    
    //did we hit the ground?
    if(box.bottom >= self.shadowRoot.getElementById('land').getBoundingClientRect().top) {
        FlappyBird.playerDead(self, false);
        return;
    }
    //have they tried to escape through the ceiling? :o
    let ceiling = self.shadowRoot.getElementById("ceiling");
    let boundCeil = ceiling.getBoundingClientRect();
    if(boxtop <= (boundCeil.bottom) && self.position < 0)
        self.position = 0;
    
    //search next pipe
    let nextPipe = self.shadowRoot.querySelector(".nextpipe");
    if (nextPipe) {
      let nextUpperPipe = nextPipe.children.item(0);
      let nextLowerPipe = nextPipe.children.item(1);
      
      let upperBound = nextUpperPipe.getBoundingClientRect();
      let pipetop = upperBound.bottom;
      let pipeleft = upperBound.left; // for some reason it starts at the inner pipes offset, not the outer pipes.
      let piperight = upperBound.right;
      let pipebottom = nextLowerPipe.getBoundingClientRect().top;
      
      //have we gotten inside the pipe yet?
      if(boxright > pipeleft) {
          //we're within the pipe, have we passed between upper and lower pipes?
          if(boxtop <= pipetop || boxbottom >= pipebottom) {
            //no! we touched the pipe
            FlappyBird.playerDead(self, true);
            return;
          }
      }
      
      //have we passed the imminent danger?
      if(boxleft > piperight) {
          //yes, remove item
          nextPipe.classList.remove("nextpipe");
          //and score a point
          self.score += 1;
          FlappyBird.play(self, Sound.score);
      }
    } else {
      let closest = 999;
      let closestPipe: Element;
      self.shadowRoot.querySelectorAll(".pipe").forEach(pipe => {
          let left = pipe.getBoundingClientRect().left;
          if (left > 80 && left < closest) {
            closest = left;
            closestPipe = pipe;
          }
      });

      if(closestPipe)
        closestPipe.classList.add("nextpipe");
    }
  }

  private static playerJump(self: FlappyBird) {
    self.velocity = self.jump;
    FlappyBird.play(self, Sound.jump);
  }

  private static playerDead(self: FlappyBird, drop: boolean) {
    //destroy our gameLoops
    clearInterval(self.loopGameloop);
    clearInterval(self.loopPipeloop);
    clearInterval(self.loopAutoPilot);
    self.loopGameloop = null;
    self.loopPipeloop = null;
    self.loopAutoPilot = null;

    //stop animating everything!
    self.cssAnimatedState = AnimationState.paused;
    FlappyBird.play(self, Sound.hit).then(() => {

      if (drop) {
        //drop the bird to the floor
        let playerDom = self.shadowRoot.getElementById("player");
        let floor = self.flyArea;
        self.rotation = 90;
        const nextPos = Math.max(0, floor - playerDom.clientHeight);
        self.cssPlayer = "transition: all " + (300 + Math.floor((nextPos - self.position)/nextPos*700))  + "ms cubic-bezier(0.1, -0.37, 1, 1);";
        self.position = nextPos;
      }

      FlappyBird.play(self, Sound.die).then(() => {
        FlappyBird.showScore(self);
      });
    });
  }

  private static showScore(self: FlappyBird) {
    
    //it's time to change states. as of now we're considered ScoreScreen to disable left click/flying
    self.currentstate = GameState.ScoreScreen;
    
    //have they beaten their high score?
    if(self.score > self.highscore) {
        self.highscore = self.score;
        FlappyBird.setCookie("highscore", self.highscore, 999);
    }

    self.cssScoreBoard = "display: block;";
    setTimeout(function() {
      self.cssScoreBoard = "display: block; opacity: 1; top: 64px; transition: all 0.6s ease-in;";
      FlappyBird.play(self, Sound.swoosh);
      
      self.cssMedal = "";
      setTimeout(function() {
        self.cssReplay = "opacity: 1; top: 205px; transition: all 0.6s ease-in;";
        FlappyBird.play(self, Sound.swoosh);
      }, 600);

      if (self.score >= 10) {
        self.cssMedal = "";
        setTimeout(function() {
          self.cssMedal = "transform: scale(1); opacity: 1; transition: all 1.2s ease-in;"
        }, 500);
      }
    }, 100);
  }

  private static updatePipes(self: FlappyBird) {
    let constraint = self.flyArea - self.pipeHeight - (self.pipePadding * 2); //double padding (for top and bottom)
    let topheight = Math.floor((Math.random() * constraint) + self.pipePadding); //add lower padding
    let bottomheight = (self.flyArea - self.pipeHeight) - topheight;
    self.pipes[self.pipesIdx++ % 3] = {topheight: topheight, bottomheight: bottomheight};
  }

  private static getCookie(cname: string) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i=0; i < ca.length;i++) {
        let c = ca[i].trim();
        if (c.indexOf(name) == 0)
          return c.substring(name.length,c.length);
    }
    return null;
  }

  private static setCookie(cname: string, cvalue: Object, exdays: number) {
    let d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
  }
  
  private static play(self: FlappyBird, url: string): Promise<Event> {
    return new Promise(function(resolve, reject) {
        var audio = new Audio();
        audio.preload = "auto";
        audio.autoplay = true;
        audio.volume = self.volume / 100;
        audio.onerror = reject;
        audio.onended = resolve;
        audio.src = url;
    });
  }

  private static autopilot(self: FlappyBird) {
    let pipe = self.shadowRoot.querySelector(".nextpipe");
    var target;
    if (pipe)
      target = pipe.children.item(1).getBoundingClientRect().top - (pipe.children.item(1).getBoundingClientRect().top - pipe.children.item(0).getBoundingClientRect().bottom) / 2;
    else
      target = (self.shadowRoot.getElementById("land").getBoundingClientRect().top) / 2;

    if ((self.shadowRoot.getElementById("player").getBoundingClientRect().top - target) > 0) {
      self.screenClick()
    }
  }

}