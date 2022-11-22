// Canvas setup //
const canvas = document.querySelector('canvas');
const scoreSc = document.querySelector('#score');
const contex = canvas.getContext('2d');

canvas.width = 600
canvas.height = 600
let canvasPosition = canvas.getBoundingClientRect();

// Player //
class Player {
    constructor(){
        this.velocity = {
            x: 0,
        }
        //img setup
        this.opacity = 1
        const image = new Image()
        image.src = './sprites/ship.png'
        //image scale and position on load
        image.onload = () => {
            const scale = 0.9
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            }
        }
    }
    // Image setpp on Canvas //
    draw(){
        contex.save()
        contex.globalAlpha = this.opacity
        contex.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
        contex.restore()
    }
    update(){
        // updates img position
        if (this.image){
            this.draw()
            this.position.x += this.velocity.x
        }
    }
}

// Invader //
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
    // creates a new array and pushes invaders projectiles
    // invader projectile speed and position
    shoot(invaderProjectiles){
        invaderProjectiles.push(new InvaderProjectile({
            position: {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height
            },
            velocity: {
                x: 0,
                y: 5
            }

        }))
    }
}

// create random grid of invaders  // 
class InvaderGrid {
    // position, speed and array
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

// player projectile
class Projectile {
    //position, speed, size
    constructor({position, velocity}){
        this.position = position
        this.velocity = velocity

        this.radius = 3
    }
    // draws red circle 
    draw(){
        contex.beginPath()
        contex.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2)
        contex.fillStyle = 'red'
        contex.fill()
        contex.closePath()
    }
    // update player projectile
    update(){

        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}
// invader projectiles
class InvaderProjectile {
    // position, speed, size
    constructor({position, velocity}){
        this.position = position
        this.velocity = velocity

        this.width = 3
        this.height = 10
    }
    // draws a white line
    draw(){
        contex.fillStyle = 'white'
        contex.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    // update enemy projectile
    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

const player = new Player()

const projectiles = []
const grids = []
const invaderProjectiles = []


// Player vertical movement with mouse
const mouse = {
    x: canvas.width/2,
    y: canvas.height/2,
    move: false
}
    canvas.addEventListener("mousemove", function(e){
    mouse.move = true
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
    //console.log(mouse.x, mouse.y)
});


function playerMovement(){

   if(mouse.move === true){
    player.position.x = mouse.x
   }

}

let frames = 0
let randomInterval = Math.floor(Math.random() * 500 + 500)
let game = {
    over: false,
    active: true
}
let score = 0

// animates game on canvas //
function animate(){
    if(!game.active) return
    requestAnimationFrame(animate)
    contex.fillStyle = 'black'
    contex.fillRect(0, 0, canvas.width, canvas.height)
    
    player.update()
    playerMovement()

    invaderProjectiles.forEach((invaderProjectile, index) => {
        if(invaderProjectile.position.y + invaderProjectile.height >= canvas.height){
            setTimeout(()=>{
                invaderProjectiles.splice(index, 1)
            },0) 
        }else
            invaderProjectile.update()
            if(invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
                invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
                invaderProjectile.position.x <= player.position.x + player.width){
                    console.log('ded')
                    setTimeout(() =>{
                        invaderProjectiles.splice(index, 1)
                        player.opacity = 0
                        game.over = true
                    },0)
                    setTimeout(() =>{
                        game.active = false
                    },100)
            }
        
    })
    
    projectiles.forEach((projectile, index) => {
        if(projectile.position.y + projectile.radius <= 0){
            setTimeout(()=>{
                projectiles.splice(index, 1)
            },0)
        }else{
            projectile.update()
        }
    })
    grids.forEach((grid, gridIndex)=>{
        grid.update()
        //spawn projectiles
        if(frames % 100 === 0 && grid.invaders.length >0){
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
        }

        grid.invaders.forEach((invader, i)=>{
            invader.update({velocity: grid.velocity})

            if(invader.position.y + invader.height >= player.position.y &&
                invader.position.x + invader.width >= player.position.x &&
                invader.position.x <= player.position.x + player.width){
                    console.log('ded')
                    setTimeout(() =>{
                        player.opacity = 0
                        game.over = true
                    },0)
                    setTimeout(() =>{
                        game.active = false
                    },100)
            }

            projectiles.forEach((projectile, j)=>{
                if (
                    projectile.position.y - projectile.radius <=
                        invader.position.y + invader.height &&
                    projectile.position.x + projectile.radius >=
                        invader.position.x &&
                    projectile.position.x - projectile.radius <=
                        invader.position.x + invader.width && 
                    projectile.position.y + projectile.radius >=
                        invader.position.y 

                ) {
                    setTimeout(()=>{
                        const invaderFound = grid.invaders.find((invader2) => invader2 === invader)
                        const projectileFound = projectiles.find((projectile2) => projectile2 === projectile)

                        // remove invader and projectile
                        if(invaderFound && projectileFound){
                            score += 10
                            scoreSc.innerHTML = score
                            grid.invaders.splice(i, 1)
                            projectiles.splice(j, 1)
                            
                            if(grid.invaders.lenght > 0){
                                const firstInvader = grid.invaders[0]
                                const lastInvader = grid.invaders[grid.invaders.lenght - 1]
                                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width
                                grid.position.x = firstInvader.position.x
                            }
                        }
                    }, 0)
                }
            })
        })
    })
    // spawn new invader grid
    if (frames % randomInterval === 0){
        grids.push(new InvaderGrid())
        randomInterval = Math.floor(Math.random() * 100 + 500)
        frames = 0
    }
    frames ++

}
animate()
// create projectiles for array on mouseclick
addEventListener('click', (e) =>{
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
    e.preventDefault()
})


