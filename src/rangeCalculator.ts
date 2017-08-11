enum PointCompareRange {
    BEFORE = -1,
    IN = 0,
    AFTER = 1
}

enum RangeCompareRange {
    TOTAL_BEFORE = -3,
    HEAD_BEFORE = -2,
    CONTAIN = -1,
    INNER = 1,
    TAIL_AFTER = 2,
    TOTAL_AFTER = 3
}

const MAP_CompareRangeRange: {
    readonly [o: number]: {
        readonly [x: number]: RangeCompareRange
    }
} = Object.freeze({
    [PointCompareRange.BEFORE]: {
        [PointCompareRange.BEFORE]: RangeCompareRange.TOTAL_BEFORE,
        [PointCompareRange.IN]: RangeCompareRange.HEAD_BEFORE,
        [PointCompareRange.AFTER]: RangeCompareRange.CONTAIN
    },
    [PointCompareRange.IN]: {
        [PointCompareRange.IN]: RangeCompareRange.INNER,
        [PointCompareRange.AFTER]: RangeCompareRange.TAIL_AFTER
    },
    [PointCompareRange.AFTER]: {
        [PointCompareRange.AFTER]: RangeCompareRange.TOTAL_AFTER
    }
});

interface IRange {
    head: number;
    tail: number;
}

class MyRange implements IRange {
    private _head: number;
    public get head(): number {
        return this._head;
    }
    private _tail: number;
    public get tail(): number {
        return this._tail;
    }
    constructor(range: MyRange);
    constructor(head: number, tail: number);
    constructor(rangeOrHead: MyRange | number, tail?: number) {
        if (rangeOrHead instanceof MyRange) {
            this._head = rangeOrHead.head;
            this._tail = rangeOrHead.tail;
        } else {
            if (Number(rangeOrHead) > Number(tail)) {
                throw new RangeError('Head cannot great then tail');
            }
            this._head = Number(rangeOrHead);
            this._tail = Number(tail);
        }
    }
    compare(point: number): PointCompareRange;
    compare(range: MyRange): RangeCompareRange;
    compare(pointOrRange: MyRange | number) {
        if (pointOrRange instanceof MyRange) {
            return this.compareWithRange(pointOrRange);
        } else {
            return this.compareWithPoint(pointOrRange);
        }
    }

    public static compare(point: number, range: MyRange): PointCompareRange;
    public static compare(range1: MyRange, range2: MyRange): RangeCompareRange;
    public static compare(pointOrRange: MyRange | number, range: MyRange) {
        if (pointOrRange instanceof MyRange) {
            return MyRange.compareWithRange(pointOrRange, range);
        } else {
            return MyRange.compareWithPoint(pointOrRange, range);
        }
    }

    private static compareWithPoint(point: number, range: MyRange): PointCompareRange {
        if (point < range.head) {
            return PointCompareRange.BEFORE;
        }
        if (point > range.tail) {
            return PointCompareRange.AFTER;
        }
        return PointCompareRange.IN;
    }

    private compareWithPoint(point: number): PointCompareRange {
        return MyRange.compareWithPoint(point, this);
    }

    private static compareWithRange(range1: MyRange, range2: MyRange) {
        const result = MAP_CompareRangeRange[range1.compareWithPoint(range2.head)][range1.compareWithPoint(range2.tail)];
        if (result === undefined) {
            throw new RangeError(`There may be a RangeError in [${range1.head}, ${range1.tail}] and [${range2.head}, ${range2.tail}]`);
        }
        return result;
    }

    private compareWithRange(range: MyRange): RangeCompareRange {
        return MyRange.compareWithRange(this, range);
    }

    canAdjacent(range: MyRange): boolean {
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

    addRange(range: MyRange): MyRange[] {
        switch(this.compareWithRange(range)) {
            case RangeCompareRange.TOTAL_BEFORE:
                return this.canAdjacent(range) ? [new MyRange(range.head, this.tail)] : [range, this];
            case RangeCompareRange.HEAD_BEFORE:
                return [new MyRange(range.head, this.tail)];
            case RangeCompareRange.CONTAIN:
                return [range];
            case RangeCompareRange.INNER:
                return [this];
            case RangeCompareRange.TAIL_AFTER:
                return [new MyRange(this.head, range.tail)];
            case RangeCompareRange.TOTAL_AFTER:
                return this.canAdjacent(range) ? [new MyRange(this.head, range.tail)] : [this, range];
        }
    }

    subRange(range: MyRange): MyRange[] {
        switch(this.compare(range)) {
            case RangeCompareRange.TOTAL_BEFORE:
                return [this];
            case RangeCompareRange.HEAD_BEFORE:
                return [new MyRange(range.tail + 1, this.tail)];
            case RangeCompareRange.CONTAIN:
                return [];
            case RangeCompareRange.INNER:
                return [new MyRange(this.head, range.head - 1), new MyRange(range.tail + 1, this.tail)];
            case RangeCompareRange.TAIL_AFTER:
                return [new MyRange(this.head, range.head -1)];
            case RangeCompareRange.TOTAL_AFTER:
                return [this];
        }
    }
}

class Ranges {
    private _ranges: MyRange[] = [];
    public get ranges():MyRange[] {
        return [...this._ranges];
    }

    constructor();
    constructor(ranges: Ranges);
    constructor(ranges: IRange[]);
    constructor(ranges: number[][]);
    constructor(head: number, tail: number);
    constructor(rangesOrHead?: Ranges|IRange[]|number[][]|number, tail?: number) {
        if (rangesOrHead instanceof Ranges) {
            this._ranges = rangesOrHead.ranges;
        } else if (rangesOrHead instanceof Array && (rangesOrHead as IRange[]).every(r => (r as IRange).head !== undefined && (r as IRange).tail !== undefined )) {
            this._ranges = (rangesOrHead as IRange[]).map(r => new MyRange(r.head, r.tail));
        } else if (rangesOrHead instanceof Array && (rangesOrHead as number[][]).every(r => r instanceof Array && typeof r[0] === 'number' && typeof r[1] === 'number')) {
            this._ranges = (rangesOrHead as number[][]).map(r => new MyRange(r[0], r[1]));
        } else if (typeof rangesOrHead === 'number') {
            this._ranges.push(new MyRange(rangesOrHead, tail));
        }
    }

    sort() {
        this._ranges.sort(MyRange.compare);
    }

    connect() {
        if (this._ranges.length === 0) return;
        const ranges = this.ranges;
        return this._ranges = ranges.sort().reduce((pre: MyRange[], cur: MyRange): MyRange[] => {
            if (pre.length === 0) {
                return [cur];
            } else {
                return pre.concat(pre.splice(-1)[0].addRange(cur));
            }
        }, []);
    }

    contain(point: number) {
        this.ranges.some(v => v.compare(point) === PointCompareRange.IN);
    }
}
