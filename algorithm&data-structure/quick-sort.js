function quickSort(arr) {

    if (arr.length <= 1) {
        return arr;
    }

    let leftArr = [];
    let rightArr = [];
    let q = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > q) {
            rightArr.push(arr[i]);
        } else {
            leftArr.push(arr[i]);
        }
    }

    return [].concat(quickSort(leftArr), [q], quickSort(rightArr));
}
console.log(quickSort([1, 4, 6, 12, 4, 6, 4, 47, 5, 3, 5, 6]))