class CubicBSpline {
    static degree = 3
    static M = new THREE.Matrix4().set(
        -1, 3, -3, 1,
        3, -6, 3, 0,
        -3, 0, 3, 0,
        1, 4, 1, 0,
    ).multiplyScalar(1 / 6)
    static dM = new THREE.Matrix4().set(
        -1, 3, -3, 1,
        2, -4, 2, 0,
        -1, 0, 1, 0,
        0, 0, 0, 0
    ).multiplyScalar(1 / 2)

    constructor(controlPoints) {
        return (async () => {
            this.controlPoints = []
            this.curvePoints = []
            this.curveTangents = []

            if (typeof (controlPoints) === "string")
                await this.parseControlPoints(controlPoints).then((parsedControlPoints) => {
                    this.controlPoints = parsedControlPoints
                    this.finishSetUp()
                })
            else if (controlPoints.isArray) {
                this.controlPoints = controlPoints
                this.finishSetUp()
            } else throw "Invalid b-spline control points parameter"

            return this
        })()
    }

    finishSetUp() {
        if (this.controlPoints.length <= CubicBSpline.degree + 1) throw "Insufficient number of control points"
        this.numberOfSplineSegments = this.controlPoints.length - 3
    }

    async parseControlPoints(url) {
        return new Promise(function (resolve) {
            Helpers.readTextFile(url, function (jsonText) {
                let parsedPoints = []

                let jsonData = JSON.parse(jsonText)
                if (jsonData.points === undefined) console.log("Invalid JSON file given!")
                jsonData.points.forEach(jsonPoint => parsedPoints.push(new THREE.Vector3(jsonPoint.x, jsonPoint.y, jsonPoint.z)))

                resolve(parsedPoints)
            })
        })
    }

    calculatePoint(t) {
        let i = Helpers.clamp(Math.floor(this.numberOfSplineSegments * t), 0, this.numberOfSplineSegments - 1)
        let segmentT = Math.max(0, this.numberOfSplineSegments * t - i)

        let point = new THREE.Vector4().copy(this.getVariableVector(segmentT))
        point.copy(Helpers.multiplyVectorByMatrix(point, CubicBSpline.M))
        point.copy(Helpers.multiplyVectorByMatrix(point, this.getControlPointMatrix(i + 1)))

        return new THREE.Vector3().set(point.x, point.y, point.z)
    }

    calculateTangentAtPoint(t) {
        let i = Helpers.clamp(Math.floor(t * this.numberOfSplineSegments), 0, this.numberOfSplineSegments - 1)
        let segmentT = Math.max(0, this.numberOfSplineSegments * t - i)

        // let point = new THREE.Vector4().copy(this.getVariableDerivativeMatrixShortened(segmentT))
        // point.copy(Helpers.multiplyVectorByMatrix(point, CubicBSpline.dM))
        // point.copy(Helpers.multiplyVectorByMatrix(point, (this.getControlPointMatrix(i + 1))))

        let point = new THREE.Vector4().copy(this.getVariableDerivativeMatrix(segmentT))
        point.copy(Helpers.multiplyVectorByMatrix(point, CubicBSpline.M))
        point.copy(Helpers.multiplyVectorByMatrix(point, (this.getControlPointMatrix(i + 1))))

        return new THREE.Vector3().set(point.x, point.y, point.z)
    }

    calculateSecondDerivativeAtPoint(t) {
        let i = Helpers.clamp(Math.floor(t * this.numberOfSplineSegments), 0, this.numberOfSplineSegments - 1)
        let segmentT = Math.max(0, this.numberOfSplineSegments * t - i)

        let point = new THREE.Vector4().copy(this.getVariableSecondDerivativeMatrix(segmentT))
        point.copy(Helpers.multiplyVectorByMatrix(point, CubicBSpline.M))
        point.copy(Helpers.multiplyVectorByMatrix(point, (this.getControlPointMatrix(i + 1))))

        return new THREE.Vector3().set(point.x, point.y, point.z)
    }
    
    calculateLocalT(t) {
        let i = Helpers.clamp(Math.floor(t * this.numberOfSplineSegments), 0, this.numberOfSplineSegments - 1)
        return Math.max(0, this.numberOfSplineSegments * t - i)
    }

    getVariableVector(t) { //with M
        return new THREE.Vector4().set(t * t * t, t * t, t, 1)
    }

    getVariableDerivativeMatrixShortened(t) { //with M
        return new THREE.Vector4().set(t * t, t, 1, 0)
    }

    getVariableDerivativeMatrix(t) { //with dM
        return new THREE.Vector4().set(3 * t * t, 2 * t, 1, 0)
    }

    getVariableSecondDerivativeMatrix(t) { //with M
        return new THREE.Vector4().set(6 * t , 2, 0, 0)
    }

    getControlPointMatrix(i) {
        return new THREE.Matrix4().set(
            this.controlPoints[i - 1].x, this.controlPoints[i - 1].y, this.controlPoints[i - 1].z, 1,
            this.controlPoints[i].x, this.controlPoints[i].y, this.controlPoints[i].z, 1,
            this.controlPoints[i + 1].x, this.controlPoints[i + 1].y, this.controlPoints[i + 1].z, 1,
            this.controlPoints[i + 2].x, this.controlPoints[i + 2].y, this.controlPoints[i + 2].z, 1,
        )
    }
    
    setCurvePoints(numberOfPoints, curvePoints) {
        this.curvePoints = curvePoints
    }

    setCurveTangents(numberOfPoints, curveTangents) {
        this.curveTangents = curveTangents
    }
}