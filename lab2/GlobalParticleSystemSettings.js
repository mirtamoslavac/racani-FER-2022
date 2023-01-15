class GlobalParticleSystemSettings {
    static maxNumberOfParticles = 512

    static shouldStartAndSpreadOutFromSameInitialPoint = false
    static initialParticlePosition = new THREE.Vector3(0, 0, 0)
    static maximumParticleLifetime = 3

    static spawningSpeed = 5 //the odder the number, the slower should a batch of particles spawn
    static spawningAmountFactor = 5 //the lower the number, the more particles should spawn in one batch

    static shouldParticlesExpand = true // if true, the particles will grow from scale 0 to possible maximum scale, and will collapse if otherwise
    static scalingFactor = 3 // the larger the amount, the larger could the particles become

    static shouldChangeColour = true
    static colourChangeSpeed = 137 //the odder the number, the slower should the particles change their colour
    static particleOpacity = 0.95 // the larger the number [0, 1], the less transparent the particles are
    static initialParticleColour = 0xFFFFFF

    static whiteSceneBackgroundColor = new THREE.Color(0xFFFFFF)
    static blackSceneBackgroundColor = new THREE.Color(0x000000)
}