// Canvas setup //
const canvas = document.querySelector('canvas');
const contex = canvas.getContext('2d');

canvas.width = 600
canvas.height = 600

// PLayer class //
class Player {
    constructor(){
        this.velocity = {
            x: 0,
            y: 0
        }
        const image = new Image()
        image.src = './sprites/ship.png'
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
    draw(){
        // Image setUp on Canvas //
        contex.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }
    update(){
        if (this.image){
            this.draw()
            this.position.x += this.velocity.x
        }
    }
}

// Invader Class //
class Invader {
    constructor({position}){
        this.velocity = {
            x: 0,
            y: 0
        }
        const image = new Image()
        image.src = './sprites/invader.png'
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
    draw(){
        contex.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }
    update({velocity}){
        if (this.image){
            this.draw()
            this.position.x += velocity.x
            this.position.y += velocity.y
        }
    }
}

// Grid layout for invaders // 
class Grid {
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
        const rows = Math.floor(Math.random() * 5 + 2);
        const columns = Math.floor(Math.random() * 10 + 5);
        this.width = columns * 40
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

// Projectile class //
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

const player = new Player()

const projectiles = []
const grids = []


// Player movement a, d & space//
const keys ={
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    space: {
        pressed: false
    }
}
function playerMovement(){
    if (keys.a.pressed && player.position.x >=0){
        player.velocity.x = -5
    } else if (keys.d.pressed && player.position.x +player.width <= canvas.width){
        player.velocity.x = 5
    }else{
        player.velocity.x = 0
    }

}
let frames = 0
let randomInterval = Math.floor(Math.random() * 500 + 500)

// animates game on canvas //
function animate(){
    requestAnimationFrame(animate)
    contex.fillStyle = 'black'
    contex.fillRect(0, 0, canvas.width, canvas.height)
    
    player.update()
    playerMovement()
    projectiles.forEach((projectile, index) => {
        if(projectile.position.y + projectile.radius <= 0){
            setTimeout(()=>{
                projectiles.splice(index, 1)
            },0)
        }else{
            projectile.update()
        }
    })
    grids.forEach((grid)=>{
        grid.update()
        grid.invaders.forEach((invader, i)=>{
            invader.update({velocity: grid.velocity})

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
                        if(invaderFound && projectileFound){
                        grid.invaders.splice(i, 1)
                        projectiles.splice(j, 1)
                        }
                    }, 0)
                }
            })
        })
    })
    if (frames % randomInterval === 0){
        grids.push(new Grid())
        randomInterval = Math.floor(Math.random() * 500 + 500)
        frames = 0
    }
    frames ++

}
animate()
// key setups// 
addEventListener('keydown', ({key}) =>{
    console.log(key)
    switch (key) {
        case 'a':
            console.log('left')
            keys.a.pressed = true
            break;
        case 'd':
            console.log('right')
            keys.d.pressed = true
            break;
        case ' ':
            console.log('space')
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
            console.log(projectiles)
            break;
    }
})
addEventListener('keyup', ({key}) =>{
    console.log(key)
    switch (key) {
        case 'a':
            console.log('left')
            keys.a.pressed = false
            break;
        case 'd':
            console.log('right')
            keys.d.pressed = false
            break;
        case ' ':
            console.log('space')
            break;
    }
})