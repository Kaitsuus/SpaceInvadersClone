const canvas = document.querySelector('canvas');
const contex = canvas.getContext("2d");
const scoreOnScreen = document.querySelector('#score');
const startGameBtn = document.querySelector('#start')
let canvasPosition = canvas.getBoundingClientRect();
canvas.width = 600;
canvas.height = 600;



// player class
class Player {
    constructor(){
        // player velocity
        this.velocity = {
            x: 0,
            y: 0
        }
        this.opacity = 1
        const image = new Image()
        image.src = "./sprites/ship.png"
        image.onload = ()=>{
            const scale = 1
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                // player start position
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            }
        }       
    }
    draw(){
        contex.save()
        contex.globalAlpha = this.opacity
        contex.drawImage(this.image, this.position.x, this.position.y)
        contex.restore()
    }
    update(){
        if (this.image){
            this.draw()
            this.position.x += this.velocity.x
        }
    }
}

// Enemy //
class Invader {
    constructor({position}){
        this.velocity = {
            x: 0,
            y: 0
        }
         //img setup
        const image = new Image()
        image.src = './sprites/invader.png'
        //image scale and position on load
        image.onload = () => {
            const scale = 0.5
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x: position.x,
                y: position.y
            }
        }
    }
    // Image setpp on Canvas //
    draw(){
        contex.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }
    // updates img position
    update({velocity}){
        if (this.image){
            this.draw()
            this.position.x += velocity.x
            this.position.y += velocity.y
        }
    }
    invaderShoot(invaderProjectiles){
        invaderProjectiles.push(new InvaderProjectile({
            position: {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height
            },
            velocity: {
                x:0,
                y: 5
            }
        }))
    }
}
// create random grid of enemys  // 
class InvaderGrid {
    // position, velocity and array
    constructor(){
        this.position = {
            x: 0,
            y: 0
        }
        this.velocity = {
            x: 3,
            y: 0
        }
        this.invaders = []
        // random amount of rows and columns
        const rows = Math.floor(Math.random() * 3 + 2);
        const columns = Math.floor(Math.random() * 5 + 5);
        this.width = columns * 40
        // create and push new array
        for (let x = 0; x < columns; x++){
            for (let y = 0; y < rows; y++){
                this.invaders.push(new Invader({
                    position: {
                        x: x * 40,
                        y: y * 40
                    }
                }))
            }
        }
    }

    update(){
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        this.velocity.y = 0
        if(this.position.x + this.width >= canvas.width || this.position.x <=0){
            this.velocity.x = -this.velocity.x
            this.velocity.y = 30
        }
    }
}
class Projectile {
    constructor({position, velocity}){
        this.position = position
        this.velocity = velocity

        this.radius = 3
    }

    draw(){
        contex.beginPath()
        contex.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2)
        contex.fillStyle = 'red'
        contex.fill()
        contex.closePath()
    }
    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class InvaderProjectile {
    constructor({position, velocity}){
        this.position = position
        this.velocity = velocity
        this.width = 3
        this.height = 10
    }
    draw(){
        contex.fillStyle = 'white'
        contex.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}



const player = new Player()
const grids = []
const projectiles = []
const invaderProjectiles = []
let frames = 0
let randomInterval = Math.floor(Math.random() * 500 + 500)
let game = {
    over: false,
    active: true,
}
let score = 0

function shoot(){
    projectiles.forEach((projectile, index)=>{
        if(projectile.position.y + projectile.radius <= 0){
            setTimeout(()=>{
                projectiles.splice(index, 1)
            },0)
        }else{
            projectile.update()
        }
    })
}
function win(){
    if(score === 999){
        grids.forEach((grid, gridIndex)=>{
            grids.splice(gridIndex, 1)
            grid.update()
            setTimeout(()=>{
                game.over = true
                console.log('You Win')
            },0)
            setTimeout(()=>{
                game.active = false
            },100)
        })
    }
}


function spawnInvaders(){
        // spawn enemys
        grids.forEach((grid, gridIndex)=>{
            grid.update()


            if(frames % 100 === 0 && grid.invaders.length >0){
                grid.invaders[Math.floor(Math.random()* grid.invaders.length)].invaderShoot(invaderProjectiles)
            }

            grid.invaders.forEach((invader, i)=>{
                invader.update({velocity: grid.velocity})

                // collision detection
                projectiles.forEach((projectile, j)=>{
                    if(
                    projectile.position.y - projectile.radius <=
                    invader.position.y + invader.height && 
                    projectile.position.x + projectile.radius >=
                    invader.position.x && 
                    projectile.position.x - projectile.radius <=
                    invader.position.x + invader.width &&
                    projectile.position.y + projectile.radius >=
                    invader.position.y
                ){
                    // Garbage controll and score
                    setTimeout(()=>{
                    const invaderFound = grid.invaders.find((invader2) => invader2 === invader)
                    const projectileFound = projectiles.find((projectile2) => projectile2 === projectile)
                    
                    if(invaderFound && projectileFound){
                        score += 1
                        scoreOnScreen.innerHTML = score
                        grid.invaders.splice(i, 1)
                        projectiles.splice(j, 1)
                        // set new left and right for enemyGrid
                        if(grid.invaders.length > 0){
                            const firstInvader = grid.invaders[0]
                            const lastInvader = grid.invaders[grid.invaders.length - 1]

                            grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width
                            grid.position.x = firstInvader.position.x
                        } else {
                            grids.splice(gridIndex, 1)
                        }
                        }
                    }, 0)

                }
                // if enemy is to fardown gameover
                if(invader.position.y >= player.position.y){
                    console.log('dead')
                    setTimeout(()=>{
                        player.opacity = 0
                        game.over = true
                    },0)
                    setTimeout(()=>{
                        game.active = false
                    },100)
                }
            })
            
        })
    })
        // create and push new enemygrid at random
    if (frames % randomInterval === 0){
        grids.push(new InvaderGrid())
        randomInterval = Math.floor(Math.random() * 100 + 500)
        frames = 0
        console.log(grids)
    }
    frames ++
}

function invaderShoots(){
    invaderProjectiles.forEach((invaderProjectile, index)=>{
        if(invaderProjectile.position.y + invaderProjectile.height >= canvas.height){
            setTimeout(()=>{
                invaderProjectiles.splice(index, 1)
            }, 0)
        }else
        invaderProjectile.update()
        //  collision detection for invader projectiles
        if(invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
            invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
            invaderProjectile.position.x <= player.position.x + player.width){
                console.log('GameOver')
                setTimeout(()=>{
                    invaderProjectiles.splice(index, 1)
                    player.opacity = 0
                    game.over = true
                },0)
                setTimeout(()=>{
                    game.active = false
                },100)
            }
    })
}

// animate

function animate(){
    if(!game.active) return
    requestAnimationFrame(animate)
    contex.fillStyle = 'black'
    contex.fillRect(0, 0, canvas.width, canvas.height)
    player.update()
    //playerMouseMovement()
    shoot()
    spawnInvaders()
    invaderShoots()
    win()

}
startGameBtn.addEventListener('click', function(){
    animate()
    startGameBtn.style.display = 'none'
    console.log('Game Started')
})

canvas.addEventListener('click', (e) =>{
    e.preventDefault()
    if(game.over) return
    projectiles.push(new Projectile({
        position: {
            x: player.position.x + player.width / 2,
            y: player.position.y
        },
        velocity: {
            x: 0,
            y: -10
        }
    }))
})
/*
const mouse = {
    x: canvas.width/2 - player.width / 2,
    y: canvas.height/2,
}
    canvas.addEventListener("mousemove", function(e){
    mouse.move = true
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
    //console.log(mouse.x, mouse.y)
});
*/
canvas.addEventListener("mousemove", function(e){getMousePosition(canvas, e);});
function getMousePosition(canvas, event) {
    event.preventDefault();
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    //let xl = event.clientx - rect.right;
    //console.log("Coordinate x: " + x, "Coordinate y: " + y);
    //console.log(x)
    player.position.x = x
    if(player.position.x >= 590){
        player.position.x = x -60
    }
    player.position.y = player.position.y
    
}
/*
function playerMouseMovement(){

    if(mouse.move === true){
     player.position.x = mouse.x
     player.position.y = player.position.y
    }
 
 }
*/