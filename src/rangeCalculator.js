const Enum_ComparePointRange = Object.freeze({
    BEFORE: -1,
    IN: 0,
    AFTER: 1
});

const Enum_CompareRangeRange = Object.freeze({
    TOTAL_BEFORE: -3,
    HEAD_BEFORE: -2,
    CONTAIN: -1,
    INNER: 1,
    TAIL_AFTER: 2,
    TOTAL_AFTER: 3
});

const MAP_CompareRangeRange = Object.freeze({
    [Enum_ComparePointRange.BEFORE]: {
        [Enum_ComparePointRange.BEFORE]: Enum_CompareRangeRange.TOTAL_BEFORE,
        [Enum_ComparePointRange.IN]: Enum_CompareRangeRange.HEAD_BEFORE,
        [Enum_ComparePointRange.AFTER]: Enum_CompareRangeRange.CONTAIN
    },
    [Enum_ComparePointRange.IN]: {
        [Enum_ComparePointRange.IN]: Enum_CompareRangeRange.IN,
        [Enum_ComparePointRange.AFTER]: Enum_CompareRangeRange.TAIL_AFTER
    },
    [Enum_ComparePointRange.AFTER]: {
        [Enum_ComparePointRange.AFTER]: Enum_CompareRangeRange.TOTAL_AFTER
    }
});

const comparePointRange = (point, range) => {
    if (point < range[0]) {
        return Enum_ComparePointRange.BEFORE;
    }
    if (point > range[1]) {
        return Enum_ComparePointRange.AFTER;
    }
    return Enum_ComparePointRange.IN;
};

const CompareRangeRange = (range1, range2) => {
    const result = MAP_CompareRangeRange[comparePointRange(range1[0], range2)][comparePointRange(range1[1], range2)];
    if (result === undefined) {
        throw new RangeError(`There may be a RangeError in [${range1[0]}, ${range1[1]}] and [${range2[0]}, ${range2[1]}]`);
    }
    return result;
};

class Range {
    constructor(head, tail) {
        if (head > tail) {
            throw RangeError('Head cannot great then tail');
        }
        this.head = head;
        this.tail = tail;
    }

    compareWithPoint(p) {
        if (p < this.head) {
            return Enum_ComparePointRange.BEFORE;
        }
        if (p > this.tail) {
            return Enum_ComparePointRange.AFTER;
        }
        return Enum_ComparePointRange.IN;
    }

    compareWithRange(range) {
        if (!(range instanceof Range)) {
            throw new TypeError('Argument\'s range should be a instance of Range');
        }
        const result = MAP_CompareRangeRange[this.compareWithPoint(range.head)][this.compareWithPoint(range.tail)];
        if (result === undefined) {
            throw new RangeError(`There may be a RangeError in [${range.head}, ${range.tail}] and [${this.head}, ${this.tail}]`);
        }
        return result;
    }

    compare(pointOrRange) {
        if (pointOrRange instanceof Range) {
            return this.compareWithRange(pointOrRange);
        } else if (typeof pointOrRange === 'number') {
            return this.compareWithPoint(pointOrRange);
        }
    }

    canAdjacent(range) {
        if (range instanceof Range) {
            if ((range.head === this.tail + 1) && Number.isSafeInteger(range.head)) {
                return true;
            }
            if ((this.head === range.tail + 1) && Number.isSafeInteger(this.head)) {
                return true;
            }
            return false;
        }
        throw new TypeError('Argument\'s range should be a instance of Range');
    }

    addRange(range) {
        if (range instanceof Range) {
            switch(this.compareWithRange(range)) {
                case Enum_CompareRangeRange.TOTAL_BEFORE:
                    return canAdjacent(range) ? [new Range(range.head, this.tail)] : new Ranges();
                case Enum_CompareRangeRange.HEAD_BEFORE:
                case Enum_CompareRangeRange.CONTAIN:
                case Enum_CompareRangeRange.IN:
                case Enum_CompareRangeRange.TAIL_AFTER:
                case Enum_CompareRangeRange.TOTAL_AFTER:
            }
        }
        throw new TypeError('Argument\'s range should be a instance of Range');
    }
}









class Ranges {
    constructor(headOrArray, tail) {
        if (headOrArray instanceof Array) {
            if (headOrArray.every(a => a instanceof Range)) {
                this.ranges = headOrArray;
            } else {
                this.ranges = headOrArray.map(r => {
                    if (typeof r[0] === 'number' && typeof r[1] === 'number') {
                        return new Range(r[0], r[1]);
                    }
                    throw new TypeError('Some instance is not instance of Range and cannot convert to Range');
                });
            }
        } else if (typeof headOrArray === 'number' && typeof tail === 'number'){
            if (headOrArray > tail) {
                throw new RangeError(`head: ${headOrArray} is great than tail: ${tail}`);
            }
            this.ranges = [new Range(headOrArray, tail)];
        } else {
            this.ranges = [];
        }
        this.connectRanges();
    }

    connectRanges() {
        if (this.ranges.length === 0) return;
        var ranges = this.ranges;
        ranges.sort(CompareRangeRange).reduce((pre, cur) => {
            if (pre.length === 0) {
                return [cur];
            } else {
                pre[pre.length - 1]
            }
        }, []);
        var results = [], r1 = ranges[0], i, r2, result;
        for(i=1; i<ranges.length; i++){
            r2 = ranges[i];
            result = addRR(r1, r2);
            results = results.concat(result);
            r1 = results.pop();
        }
        results.push(r1);
        return (this.ranges = results);
    }
}

module.exports = Ranges;