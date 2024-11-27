const typeRankings = [
    'undefined',
    'null',
    'string',
    'boolean',
    'number',
    'bigint',
    'symbol',
    'object',
    'function'
];
export function breakTie(lhs, rhs) {
    if (lhs === rhs)
        return 'eq';
    const lhsType = lhs === null ? 'null' : typeof lhs;
    const rhsType = rhs === null ? 'null' : typeof rhs;
    const lhsTypeScore = typeRankings.indexOf(lhsType);
    const rhsTypeScore = typeRankings.indexOf(rhsType);
    if (lhsTypeScore > rhsTypeScore)
        return 'lhs';
    if (rhsTypeScore > lhsTypeScore)
        return 'rhs';
    switch (lhsType) {
        case 'string':
            if (lhs.length > rhs.length)
                return 'lhs';
            if (rhs.length > lhs.length)
                return 'rhs';
        default:
            if (lhs > rhs)
                return 'lhs';
            if (rhs > lhs)
                return 'rhs';
    }
    return 'eq';
}
