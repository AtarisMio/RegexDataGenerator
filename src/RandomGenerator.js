class LinearCongruentialGenerator {
    constructor(seed = new Date().valueOf()) {
        this.setSeed(seed);
    }

    setSeed(seed = new Date().valueOf()) {
        if (!Number.isSafeInteger(Number.parseInt(seed))) {
            throw `arguments may unsafe. end=${seed};`;
        }
        this.seed = Number.parseInt(seed);
        return this;
    }

    next() {
        this.seed = (this.seed * 3661 + 30809) % 145800;
        return this.seed / (145800.0);
    }
}

class CustomRandom {
    constructor(start = 0, end = 10, seed = new Date().valueOf()) {
        this.setStart(start);
        this.setEnd(end);
        this.setSeed(seed);
        this.interval = this.end - this.start;
        this.generator = new LinearCongruentialGenerator(this.seed);
    }

    setBoundary(start, end) {
        this.setStart(start);
        this.setEnd(end);
        return this;
    }

    setStart(start) {
        if (!Number.isSafeInteger(Number.parseInt(start))) {
            throw `arguments may unsafe. start=${start};`;
        }
        this.start = Number.parseInt(start);
        this.interval = this.end - this.start;
        return this;
    }

    setEnd(end) {
        if (!Number.isSafeInteger(Number.parseInt(end))) {
            throw `arguments may unsafe. end=${end};`;
        }
        this.end = Number.parseInt(end);
        this.interval = this.end - this.start;
        return this;
    }

    setSeed(seed = new Date().valueOf()) {
        if (!Number.isSafeInteger(Number.parseInt(seed))) {
            throw `arguments may unsafe. end=${seed};`;
        }
        this.seed = Number.parseInt(seed);
        return this;
    }

    next() {
        return this.start + Math.ceil(this.generator.next() * this.interval);
    }
}

CustomRandom.LinearCongruentialGenerator = LinearCongruentialGenerator;

module.exports = CustomRandom;
