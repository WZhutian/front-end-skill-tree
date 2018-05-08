//方法1:使用过滤器
function unique(a) {
    var res = a.filter(function (item, index, array) {
        return array.indexOf(item) === index;
    });
    return res;
}
var a = [1, 1, '1', '2', 1];
var ans = unique(a);
console.log(ans); // => [1, "1", "2"]

//方法2:将原数组中重复元素的最后一个元素放入结果数组中。(比较奇怪的方法)
function unique(a) {
    var res = [];
    for (var i = 0, len = a.length; i < len; i++) {
        for (var j = i + 1; j < len; j++) {
            // 如果发现相同元素
            // 则 i 自增进入下一个循环比较
            if (a[i] === a[j])
                j = ++i;
        }
        res.push(a[i]);
    }
    return res;
}
var a = [1, 1, '1', '2', 1];
var ans = unique(a);
console.log(ans); // => ["1", "2", 1]

//方法3:先排序,将相同的值放到一起
function unique(a) {
    return a.concat().sort().filter(function (item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
}
var a = [1, 1, 3, 2, 1, 2, 4];
var ans = unique(a);
console.log(ans); // => [1, 2, 3, 4]

//方法4:ES6,Set秒杀所有方法
function unique(a) {
    return Array.from(new Set(a));
}
var a = [{ name: "fwef" }, { age: 30 }, new String(1), new Number(1)];
var ans = unique(a);
console.log(ans); // => [Object, Object, String, Number]