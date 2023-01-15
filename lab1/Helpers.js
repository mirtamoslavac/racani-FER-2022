class Helpers {
    static clamp = (num, min, max) => Math.min(Math.max(num, min), max)

    static multiplyVectorByMatrix(vector, matrix) {
        return new THREE.Vector4(vector.x * matrix.elements[0] + vector.y * matrix.elements[1] + vector.z * matrix.elements[2] + vector.w * matrix.elements[3],
            vector.x * matrix.elements[4] + vector.y * matrix.elements[5] + vector.z * matrix.elements[6] + vector.w * matrix.elements[7],
            vector.x * matrix.elements[8] + vector.y * matrix.elements[9] + vector.z * matrix.elements[10] + vector.w * matrix.elements[11],
            vector.x * matrix.elements[12] + vector.y * matrix.elements[13] + vector.z * matrix.elements[14] + vector.w * matrix.elements[15])
    }


    static generateRandomColour() {
        let colorRand = 0xFFFFFF
        do {
            colorRand = Math.random() * 0xFFFFFF
        } while (colorRand === 0xFFFFFF)

        return colorRand
    }

    static zip = (...arrays) => {
        const length = Math.min(...arrays.map(arr => arr.length))
        return Array.from({ length }, (value, index) => arrays.map((array => array[index])))
    }


    static readTextFile(file, callback) {
        let rawFile = new XMLHttpRequest()
        rawFile.overrideMimeType("application/json")
        rawFile.open("GET", file, true)
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4 && rawFile.status === 200) {
                callback(rawFile.responseText)
            }
        }
        rawFile.send(null)
    }
}