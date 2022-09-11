//https://stackoverflow.com/questions/23045652/object-comparing-check-if-an-object-contains-the-whole-other-object
export function isContainedIn(smaller, larger) {
    if (typeof smaller != typeof larger)
        return false;
    if (Array.isArray(smaller) && Array.isArray(larger)) {
        // assuming same order at least
        for (var i = 0, j = 0, la = smaller.length, lb = larger.length; i < la && j < lb; j++)
            if (isContainedIn(smaller[i], larger[j]))
                i++;
        return i == la;
    }
    else if (Object(smaller) === smaller) {
        for (var p in smaller)
            if (!(p in larger && isContainedIn(smaller[p], larger[p])))
                return false;
        return true;
    }
    else
        return smaller === larger;
}
