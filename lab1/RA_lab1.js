const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
const orbitControls = new THREE.OrbitControls(camera, renderer.domElement)
const loader = new OBJLoader()

const animationDurationInSeconds = 15
const fps = 60
const step = 1 / (animationDurationInSeconds * fps)

let loadedObject
let bSpline
let currentTangentLine

let startTime
let fpsMode = true
let t = 0

let dcmMode = false


initializeScene()
loadObj("./models/frog.obj")
    .then((object) => {
        loadedObject = new Loaded3DObject(object, new THREE.Vector3(), new THREE.Vector3(0, 0, 1), 0, 0.5)
        finishLoading()
    })

async function finishLoading() {
    {
        scene.add(loadedObject.object3D)

        bSpline = await new CubicBSpline("./bSplines/spiral.json")
        showControlPolygon()

        generateAndShowSegmentedBSpline(1000, false)
        //generateAndShowBSpline(1000)
        generateCurrentTangentLine()

        orbitControls.update()
        requestAnimationFrame(render)
    }
}


function initializeScene() {
    camera.position.set(50, 30, 50)
    camera.lookAt({x: 0, y: 0, z: 0})

    orbitControls.addEventListener('change', function () {
        pointLight.position.copy(camera.position)
    })
    orbitControls.enableDamping = true
    orbitControls.dampingFactor = 1.5
    orbitControls.enableZoom = true
    orbitControls.zoomSpeed = 0.5

    renderer.setSize(1900, 750)
    document.body.appendChild(renderer.domElement)

    let pointLight = new THREE.PointLight(0xFFFFFF)
    pointLight.position.set(10, 50, 130)
    scene.add(pointLight)

    let gridHelper = new THREE.GridHelper(150, 20, 0xE8E8E8, 0xE8E8E8)
    scene.add(gridHelper)

    let ah = new THREE.AxesHelper(75)
    ah.position.y += 0.001
    scene.add(ah)
}

async function loadObj(url) {
    return new Promise(function (resolve) {
        Helpers.readTextFile(url, function (text) {
            resolve(loader.parse(text))
        })
    })
}

function render(currentTime) {
    requestAnimationFrame(render)

    if (fpsMode) t += step
    else {
        if (!startTime) startTime = currentTime
        t = (currentTime - startTime) / (1000 * animationDurationInSeconds)
    }

    updateAnimatedLoadedObject(t)
    renderer.render(scene, camera)

    if (t >= 1) fpsMode ? t = 0 : startTime = currentTime
}

function updateAnimatedLoadedObject(t) {
    let currentTangent = bSpline.calculateTangentAtPoint(t)
    let currentPosition = bSpline.calculatePoint(t)

    if (dcmMode) {
        loadedObject.object3D.position.copy(loadedObject.initialPosition)
        loadedObject.object3D.setRotationFromAxisAngle(loadedObject.initialAxis, loadedObject.initialAngle)
        loadedObject.object3D.updateMatrix()

        let secondDerivative = bSpline.calculateSecondDerivativeAtPoint(t)
        if (secondDerivative.isZero) throw "Straight curve segment (the four control points are on the same line), choose some orientation"

        let currentNormal = new THREE.Vector3().crossVectors(currentTangent, secondDerivative)
        let currentBinormal = new THREE.Vector3().crossVectors(currentTangent, currentNormal)

        let DCM = new THREE.Matrix4()
            .set(currentTangent.x, currentNormal.x, currentBinormal.x, 0,
                currentTangent.y, currentNormal.y, currentBinormal.y, 0,
                currentTangent.z, currentNormal.z, currentBinormal.z, 0,
                0, 0, 0, 1)
            .transpose()
        // let DCM3 = new THREE.Matrix4()
        //     .set(currentTangent.x, currentNormal.x, currentBinormal.x,
        //         currentTangent.y, currentNormal.y, currentBinormal.y,
        //         currentTangent.z, currentNormal.z, currentBinormal.z)
        //      .transpose()
        // let DCM = new THREE.Matrix4().setFromMatrix3(DCM3)

        loadedObject.object3D.applyMatrix4(DCM.invert())
        loadedObject.object3D.updateMatrix()

        currentPosition = bSpline.calculatePoint(t)

        let translationMatrix4 = new THREE.Matrix4()
            .set(1, 0, 0 , 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                currentPosition.x, currentPosition.y, currentPosition.z, 1).transpose()
        // loadedObject.object3D.translateX(currentPosition.x)
        // loadedObject.object3D.translateY(currentPosition.y)
        // loadedObject.object3D.translateZ(currentPosition.z)
        loadedObject.object3D.applyMatrix4(translationMatrix4)
        loadedObject.object3D.updateMatrix()
    } else {
        const axis = new THREE.Vector3().crossVectors(loadedObject.initialAxis, currentTangent)
        const angle = Math.acos(loadedObject.initialAxis.clone().normalize().dot(currentTangent.clone().normalize()))
        loadedObject.object3D.setRotationFromAxisAngle(axis.clone().normalize(), angle)

        loadedObject.moveObject(currentPosition)
    }

    let localT = bSpline.calculateLocalT(t)
    let positions = currentTangentLine.geometry.attributes.position.array
    positions[0] = currentPosition.x
    positions[1] = currentPosition.y
    positions[2] = currentPosition.z
    positions[3] = currentPosition.x + currentTangent.x * localT
    positions[4] = currentPosition.y + currentTangent.y * localT
    positions[5] = currentPosition.z + currentTangent.z * localT
    currentTangentLine.geometry.attributes.position.needsUpdate = true
}


function showControlPolygon() {
    let lineGeom = new THREE.BufferGeometry().setFromPoints(bSpline.controlPoints)
    let line = new THREE.Line(lineGeom, new THREE.LineDashedMaterial({color: 0x808080, dashSize: 1, gapSize: 0.5}))
    line.computeLineDistances()
    scene.add(line)

    scene.add(new THREE.Points(lineGeom, new THREE.PointsMaterial({color: 0x000000})))
}

function generateAndShowBSpline(numberOfPoints) {
    let delta = 1 / numberOfPoints

    let vertices = []
    let tangents = []

    for (let t = 0; t < 1; t += delta) {
        vertices.push(bSpline.calculatePoint(t))
        tangents.push(bSpline.calculateTangentAtPoint(t))
    }
    bSpline.setCurvePoints(numberOfPoints, vertices)
    bSpline.setCurveTangents(numberOfPoints, tangents)

    let lineGeom = new THREE.BufferGeometry().setFromPoints(vertices)
    let line = new THREE.Line(lineGeom, new THREE.LineBasicMaterial({color: 0xA000A0}))
    scene.add(line)
}

function generateAndShowSegmentedBSpline(numberOfPoints, showTangents) {
    let delta = 1 / numberOfPoints

    let segmentVertices = []
    let segmentTangents = []
    let segmentTValues = []
    let previousSegmentIndex = -1

    let totalVertices = []
    let totalTangents = []

    for (let t = 0; t < 1; t += delta) {
        segmentVertices.push(bSpline.calculatePoint(t))
        segmentTangents.push(bSpline.calculateTangentAtPoint(t))

        let currentSegmentIndex = Helpers.clamp(Math.floor(t * bSpline.numberOfSplineSegments), 0, bSpline.numberOfSplineSegments - 1)
        segmentTValues.push(bSpline.numberOfSplineSegments * t - currentSegmentIndex)
        if (previousSegmentIndex !== -1 && previousSegmentIndex !== currentSegmentIndex) {
            processCurveSegmentWithTangents(totalVertices, segmentVertices, totalTangents, segmentTangents, segmentTValues, showTangents)
            segmentVertices = []
            segmentTangents = []
            segmentTValues = []
        }
        previousSegmentIndex = currentSegmentIndex
    }
    processCurveSegmentWithTangents(totalVertices, segmentVertices, totalTangents, segmentTangents, segmentTValues)

    bSpline.setCurvePoints(numberOfPoints, totalVertices)
}

function generateCurrentTangentLine() {
    let lineGeom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()])
    currentTangentLine = new THREE.Line(lineGeom, new THREE.LineBasicMaterial({color: 0x000000}))
    scene.add(currentTangentLine)
}

function processCurveSegmentWithTangents(totalVertices, segmentVertices, totalTangents, segmentTangents, segmentTValues, showTangents) {
    totalVertices.push(...segmentVertices)
    totalTangents.push(...segmentTangents)

    let colour = Helpers.generateRandomColour()
    drawCurveSegment(segmentVertices, colour)
    if (showTangents) drawTangents(segmentVertices, segmentTangents, segmentTValues, colour)
}


function drawCurveSegment(segmentVertices, randomColour) {
    let lineGeom = new THREE.BufferGeometry().setFromPoints(segmentVertices)
    let line = new THREE.Line(lineGeom, new THREE.LineBasicMaterial({color: randomColour}))
    scene.add(line)
}

function drawTangents(segmentVertices, segmentTangents, segmentTValues, randomColour) {
    let translatedSegmentTangents = segmentTangents.map((currElement, index) => {
        return new THREE.Vector3().add(segmentVertices[index]).add(currElement.multiplyScalar(segmentTValues[index]))
    })
    let zippedSegmentElements = Helpers.zip(segmentVertices, translatedSegmentTangents).flat()
    let lineGeom = new THREE.BufferGeometry().setFromPoints(zippedSegmentElements)
    let lineSegments = new THREE.LineSegments(lineGeom, new THREE.LineBasicMaterial({
        color: randomColour,
        transparent: true,
        opacity: 0.1
    }))
    scene.add(lineSegments)
}