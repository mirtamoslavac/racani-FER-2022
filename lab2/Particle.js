class Particle {
    constructor(camera, initialTime) {
        this.ageSec = 0
        this.lastSeenMs = 0

        this.lifetimeSec = Math.random() * GlobalParticleSystemSettings.maximumParticleLifetime
        this.initialTimeMs = initialTime

        let spawnRadius = this.generateRadius(100, 50)
        let spawnAngle = Math.random() * 2 * Math.PI
        this.position = GlobalParticleSystemSettings.shouldStartAndSpreadOutFromSameInitialPoint ?
            GlobalParticleSystemSettings.initialParticlePosition :
            new THREE.Vector3(spawnRadius * Math.sin(spawnAngle), spawnRadius * Math.cos(spawnAngle), spawnRadius * Math.random())

        let speedRadius = this.generateRadius(100, 5)
        let speedAngle = Math.random() * 2 * Math.PI
        this.speed = new THREE.Vector3(speedRadius * Math.sin(speedAngle), speedRadius * Math.cos(speedAngle), speedRadius * Math.random())
        if (Math.random() > 0.5) this.speed.multiplyScalar(-1)

        this.scale = 0

        this.updateParticle(camera, initialTime)
    }

    updateParticle(camera, currentTimeMs) {
        let newParticleInformation = new THREE.Object3D()

        let deltaTSec = (currentTimeMs - this.lastSeenMs) / 1000

        let changeInPosition = new THREE.Vector3(this.speed.x, this.speed.y, this.speed.z).multiplyScalar(deltaTSec)

        this.position = new THREE.Vector3(this.position.x + changeInPosition.x, this.position.y + changeInPosition.y, this.position.z + changeInPosition.z)
        newParticleInformation.position.set(this.position.x, this.position.y, this.position.z)

        newParticleInformation.setRotationFromQuaternion(camera.quaternion) // newParticleInformation.rotation.setFromRotationMatrix(camera.matrix)

        let multiplicand = GlobalParticleSystemSettings.shouldParticlesExpand ? 1 - Math.cos(this.ageSec) : Math.cos(this.ageSec)
        this.scale = multiplicand * GlobalParticleSystemSettings.scalingFactor * Math.random()
        newParticleInformation.scale.set(this.scale, this.scale, this.scale)

        newParticleInformation.updateMatrix()

        this.lastSeenMs = currentTimeMs

        return newParticleInformation
    }

    generateRadius(multiplicand, subtrahend) {
        return Math.random() * multiplicand - subtrahend
    }

    updateAge(camera, currentTimeMs) {
        this.ageSec = (currentTimeMs - this.initialTimeMs) / 1000
    }
}
