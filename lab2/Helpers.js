class Helpers {
    static clamp = (num, min, max) => Math.min(Math.max(num, min), max)

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
}