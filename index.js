/**
 * Grab Snaffles and try to throw them through the opponent's goal!
 * Move towards a Snaffle and use your team id to determine where you need to throw it.
 **/

var myTeamId = parseInt(readline()); // if 0 you need to score on the right of the map, if 1 you need to score on the left

var gauge = 0
var justLaunch = [false,false]
var turn = 0
// game loop
while (true) {
    var inputs = readline().split(' ');
    var myScore = parseInt(inputs[0]);
    var myMagic = parseInt(inputs[1]);
    var inputs = readline().split(' ');
    var opponentScore = parseInt(inputs[0]);
    var opponentMagic = parseInt(inputs[1]);

    var wizards = []
    var opponents = []
    var balls = []
    var ballToTarget;
    gauge++;
    turn++;

    var entities = parseInt(readline()); // number of entities still in game
    for (var i = 0; i < entities; i++) {
        var inputs = readline().split(' ');
        var entityId = parseInt(inputs[0]); // entity identifier
        var entityType = inputs[1]; // "WIZARD", "OPPONENT_WIZARD" or "SNAFFLE" (or "BLUDGER" after first league)
        if(entityType === "WIZARD") {
            addTo(wizards, entityId, inputs)
        } else if(entityType === "SNAFFLE") {
            addTo(balls, entityId, inputs)
        } else if(entityType === "OPPONENT_WIZARD") {
            addTo(opponents, entityId, inputs)
        }
    }
    
    for (var i = 0; i < 2; i++) {
        
        //check the nearest ball
        if(balls.length > 1) {
            sortByDistance(balls, wizards[i])
            ballToTarget = balls.reverse().pop()
        } else {
            ballToTarget = balls[0]
        }
        if(distance(ballToTarget, wizards[Math.abs(i-1)]) < 2000) {
            ballToTarget2 = balls.pop(); 
            balls.push(ballToTarget);
            ballToTarget = ballToTarget2;
        }
        if(launchBall(wizards[i], i, ballToTarget)) continue;
        //if(launchFlipendo(wizards[i], i, ballToTarget)) continue;
        //if(launchAccio(wizards[i], i, ballToTarget)) continue;
        
        var defensiveBalls = balls.filter((b) => {
            return myTeamId === 0 ? (b.x < 8000) : (b.x > 8000);
        });
        if((defensiveBalls.length /2) >= (balls.length / 3)) {
            balls.push(ballToTarget);
            print('MOVE '+defensiveBalls[0].x+' '+defensiveBalls[0].y+' 150')
            continue;
        }
        print('MOVE '+ballToTarget.x+' '+ballToTarget.y+' 150')
        justLaunch[i]=false;
            //defense = goal keeper
            //myTeamId === 0 ?
            //    print('MOVE 0 3750 150') :
            //    print('MOVE 16000 3750 150')
        //print('MOVE 8000 3750 100');
    }
}

function launchSpell(wizard, i, spellName, targetId, mana) {
    if(justLaunch[Math.abs(i-1)]===false && gauge >= mana) {
        print(spellName+' '+targetId)
        gauge -= mana
        justLaunch[i]=true
        return true
    }
    return false
}

function launchAccio(wizard, i ,ballToTarget) {
    if((balls.length === 1|| (ballToTarget.distance > 2000) //trop pret on va le chercher
        && Math.abs(ballToTarget.vx) > 200 //trop speed, on joue pas
        && ((myTeamId === 1 && (ballToTarget.x - wizard.x) > 500) //dans le bon sens de jeu
        || (myTeamId === 0 && (ballToTarget.x - wizard.x) < -500)))
    ) {
        return (launchSpell(wizard, i, 'ACCIO', ballToTarget.id, 20))
    }
    return false;
}

function launchFlipendo(wizard, i ,ballToTarget) {
    if((balls.length === 1|| (ballToTarget.distance > 1000)
     && ((myTeamId === 1 && wizard.x > 3000 && (ballToTarget.x - wizard.x) < -1000)
        || (myTeamId === 0 && wizard.x < 13000 && (ballToTarget.x - wizard.x) > 1000)))
    ) {
        return launchSpell(wizard, i, 'FLIPENDO', ballToTarget.id, 20)
    }
    return false;
}

function launchBall(wizard, i , ballToTarget) {
    printErr(wizard)
    if(wizard.state === 0 ) {
        return false;
    }
    if(myTeamId === 1) {
        print('THROW 0 3750 500')
        justLaunch[i]=false;
        return true
    } else {
        print('THROW 16000 3750 500')
        justLaunch[i]=false;
        return true
    }
}
function distance(origin, destination) {
  return Math.sqrt(
      Math.pow(destination.x - origin.x, 2) +
      Math.pow(destination.y - origin.y, 2)
  )
}
function addTo(array, entityId, input) {
    array[array.length] =  
    {
     id: entityId,
     x: parseInt(inputs[2]), // position
     y: parseInt(inputs[3]), // position
     vx: parseInt(inputs[4]), // velocity
     vy: parseInt(inputs[5]), // velocity
     state: parseInt(inputs[6]), // 1 if the wizard is holding a Snaffle, 0 otherwise
    }
}
function sortByDistance(array, base) {
    return array.sort(function(b1, b2) {
        b1.distance = distance(base, b1);
        b2.distance = distance(base, b2);
        return b1.distance - b2.distance;
    })
}