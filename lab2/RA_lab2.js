const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
const orbitControls = new THREE.OrbitControls(camera, renderer.domElement)

let particlesMesh
let particles = []
let startTime

initializeScene()
loadParticleMesh("./textures/explosion.bmp")
startScene()

function initializeScene() {
    scene.background = GlobalParticleSystemSettings.blackSceneBackgroundColor

    camera.position.set(50, 30, 50)
    camera.lookAt({x: 0, y: 0, z: 0})

    orbitControls.addEventListener('change', function () {
        pointLight.position.copy(camera.position)
    })
    orbitControls.enableDamping = true
    orbitControls.dampingFactor = 1.5
    orbitControls.enableZoom = true
    orbitControls.zoomSpeed = 0.5

    renderer.setSize(1900, 900)
    document.body.appendChild(renderer.domElement)

    let pointLight = new THREE.PointLight(0xFFFFFF)
    pointLight.position.set(10, 50, 130)
    scene.add(pointLight)

    let gridHelper = new THREE.GridHelper(150, 20, 0x1a1a1a, 0x1a1a1a)
    scene.add(gridHelper)

    let ah = new THREE.AxesHelper(75)
    ah.position.y += 0.001
    scene.add(ah)
}

function loadParticleMesh(url) {
    let particleTexture = new THREE.TextureLoader().load(url)
    let particleMaterial = new THREE.MeshBasicMaterial({
        map: particleTexture,
        transparent: true,
        color: GlobalParticleSystemSettings.initialParticleColour,
        opacity: GlobalParticleSystemSettings.particleOpacity,
    })

    particlesMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(), particleMaterial, GlobalParticleSystemSettings.maxNumberOfParticles)
    scene.add(particlesMesh)
}

function startScene() {
    orbitControls.update()
    requestAnimationFrame(render)
}

function render(currentTime) {
    requestAnimationFrame(render)

    if (!startTime) startTime = currentTime
    let currentDurationSec = (currentTime - startTime) / 1000

    particles.forEach((particle, index) => {
        particle.updateAge(camera, currentTime)
    })

    let oldSize = particles.length
    particles = particles.filter(particle => particle.ageSec < particle.lifetimeSec)
    if (oldSize !== particles.length) console.log("removed " + (oldSize - particles.length) + " particles")

    if (Math.floor(currentDurationSec * 10) % GlobalParticleSystemSettings.spawningSpeed === 0) {
        let amountOfNewParticles = Helpers.clamp(
            Math.floor(Math.random() * GlobalParticleSystemSettings.maxNumberOfParticles / GlobalParticleSystemSettings.spawningAmountFactor),
            0,
            GlobalParticleSystemSettings.maxNumberOfParticles - particles.length)

        for (let i = 0; i < amountOfNewParticles; i++) particles.push(new Particle(camera, currentTime))

        console.log("generated " + amountOfNewParticles + " particles")
    }
    particlesMesh.count = particles.length

    let colorChange = false
    particles.forEach((particle, index) => {
        let updatedParticleInformation = particle.updateParticle(camera, currentTime)
        particlesMesh.setMatrixAt(index, updatedParticleInformation.matrix)

        if (GlobalParticleSystemSettings.shouldChangeColour && Math.floor(particle.ageSec * GlobalParticleSystemSettings.colourChangeSpeed) % 10 === 0) {
            particlesMesh.setColorAt(index, new THREE.Color(Helpers.generateRandomColour()))
            colorChange = true
        }
    })

    particlesMesh.instanceMatrix.needsUpdate = true
    if (colorChange) particlesMesh.instanceColor.needsUpdate = true

    renderer.render(scene, camera)
}
