const magnitudes = {
    0: '',
    3:  'k',
    6:  'M',
    9:  'G',
    12: 'T',
    15: 'P',
    18: 'E',
    21: 'Z',
    24: 'Y' //Because we'll totally need that
};

export default function magnitude(n: number, unit: string, fixed: number): string {
    let magnitude: number = Math.log10(n);
    magnitude = Math.floor(magnitude);

    while(n > 0 && magnitude % 3 !== 0)
        magnitude--;

    n /= Math.pow(10, magnitude);
    return n.toFixed(fixed) + ' ' + magnitudes[magnitude] + unit;
}