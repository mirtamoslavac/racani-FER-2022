class Loaded3DObject {
    constructor(object3D, initialPosition, initialAxis, initialAngle, initialScale) {
        this.object3D = object3D

        object3D.position.copy(initialPosition)
        this.initialPosition = initialPosition

        object3D.setRotationFromAxisAngle(initialAxis, initialAngle)
        this.initialAxis = initialAxis
        this.initialAngle = initialAngle

        object3D.scale.multiplyScalar(initialScale)
        this.initialScale = initialScale
    }

    moveObject(newPosition) {
        this.object3D.position.copy(newPosition)
    }

    rotateObject(newRotation) {
        this.object3D.rotation.copy(newRotation)
    }
}