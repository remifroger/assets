const { roundDec, sortBy, groupBy, groupBySum, multipleGroupBySum, getMax, getMin, multipleFiltersData, isInArray, isEmpty, isObject, objToQueryString, extractBrackets } = require('../data-operations.js')
const assert = require('assert').strict

describe("data-operations | sortBy", function() {
    it("Should be able to sort array of objects on column from high to low", function() {
        const arrayOfObj = [
            { city: "Rennes", price: "162500" },
            { city: "Lille", price: "319250" },
            { city: "Lyon", price: "962500" }
        ]
        assert.deepEqual(arrayOfObj.sort(sortBy('price', true, parseInt)), [{city: "Lyon", price: "962500"}, {city: "Lille", price: "319250"}, {city: "Rennes", price: "162500"}])
    })
    it("Should be able to sort array of objects on column from low to high", function() {
        const arrayOfObj = [
            { city: "Rennes", price: "162500" },
            { city: "Lille", price: "319250" },
            { city: "Lyon", price: "962500" }
        ]
        assert.deepEqual(arrayOfObj.sort(sortBy('price', false, parseInt)), [{city: "Rennes", price: "162500"}, {city: "Lille", price: "319250"}, {city: "Lyon", price: "962500"}])
    })
})

describe("data-operations | groupBy", function() {
    it("Should be able to group array of objects on column", function() {
        const arrayOfObj = [
            { city: "Rennes", price: "5" },
            { city: "Rennes", price: "4" },
            { city: "Lille", price: "8" },
            { city: "Lyon", price: "7" }
        ]
        assert.deepEqual(groupBy(arrayOfObj, "city"), {"Rennes": [{city: "Rennes", price: "5"}, {city: "Rennes", price: "4"}], "Lille": [{city: "Lille", price: "8"}], "Lyon": [{city: "Lyon", price: "7"}]})
    })
})

describe("data-operations | groupBySum", function() {
    it("Should be able to group array of objects on column and sum the measured column", function() {
        const arrayOfObj = [
            { city: "Rennes", price: "5" },
            { city: "Rennes", price: 4 },
            { city: "Lille", price: "8" },
            { city: "Lyon", price: "7" },
            { city: "Lyon", price: 4.2 }
        ]
        assert.deepEqual(groupBySum(arrayOfObj, "city", "price"), [{city: "Rennes", price: 9}, {city: "Lille", price: 8}, {city: "Lyon", price: 11.2}])
    })
})

describe("data-operations | multipleGroupBySum", function() {
    it("Should be able to group array of objects on multiple columns and sum the measured column", function() {
        const arrayOfObj = [
            { city: "Rennes", cat: "A", price: "5", quantity: 2 },
            { city: "Rennes", cat: "B", price: 4, quantity: 1 },
            { city: "Rennes", cat: "B", price: 2.2, quantity: 20 },
            { city: "Lille", cat: "A", price: "8", quantity: 3 },
            { city: "Lille", cat: "A", price: "8", quantity: 5 },
            { city: "Lyon", cat: "A", price: "7", quantity: 12 },
            { city: "Lyon", cat: "B", price: 4.2, quantity: 4.2 }
        ]
        assert.deepEqual(multipleGroupBySum(arrayOfObj, ["city", "cat"], ["price", "quantity"]), [{city: "Rennes", cat: "A", price: 5, quantity: 2}, {city: "Rennes", cat: "B", price: 6.2, quantity: 21}, {city: "Lille", cat: "A", price: 16, quantity: 8}, {city: "Lyon", cat: "A", price: 7, quantity: 12}, {city: "Lyon", cat: "B", price: 4.2, quantity: 4.2}])
    })
})

describe("data-operations | roundDec", function() {
    it("Should be able to round a number", function() {
        const number = 5.33
        assert.strictEqual(roundDec(number, 1), 5.3)
    })
    it("Should be able to round an integer", function() {
        const number = 5
        assert.strictEqual(roundDec(number, 1), 5)
    })
})

describe("data-operations | getMax", function() {
    it("Should be able return the max", function() {
        const arrayOfObj = [
            { city: "Rennes", cat: "A", price: "5", quantity: 2 },
            { city: "Rennes", cat: "B", price: 4, quantity: 1 },
            { city: "Rennes", cat: "B", price: 2.2, quantity: 20 },
            { city: "Lille", cat: "A", price: "8.54", quantity: 3 },
            { city: "Lille", cat: "A", price: 8.3, quantity: 5 },
            { city: "Lyon", cat: "A", price: 8, quantity: 12 },
            { city: "Lyon", cat: "B", price: 4.2, quantity: 4.2 }
        ]
        assert.strictEqual(getMax(arrayOfObj, "price"), 8.54)
    })
})

describe("data-operations | getMin", function() {
    it("Should be able return the min", function() {
        const arrayOfObj = [
            { city: "Rennes", cat: "A", price: "5", quantity: 2 },
            { city: "Rennes", cat: "B", price: 4, quantity: 1 },
            { city: "Rennes", cat: "B", price: 2.2, quantity: 20 },
            { city: "Lille", cat: "A", price: "2", quantity: 3 },
            { city: "Lille", cat: "A", price: 2.03, quantity: 5 },
            { city: "Lyon", cat: "A", price: 2.001, quantity: 12 },
            { city: "Lyon", cat: "B", price: 4.2, quantity: 4.2 }
        ]
        assert.strictEqual(getMin(arrayOfObj, "price", false), 2)
    })
})

describe("data-operations | multipleFiltersData", function() {
    it("Should be able return the array filtered", function() {
        const arrayOfObj = [
            { city: "Rennes", cat: "A", price: "5", quantity: 2 },
            { city: "Rennes", cat: "B", price: 4, quantity: 1 },
            { city: "Rennes", cat: "B", price: 2.2, quantity: 20 },
            { city: "Lille", cat: "A", price: "2", quantity: 3 },
            { city: "Lille", cat: "A", price: 2.03, quantity: 5 },
            { city: "Lyon", cat: "A", price: 2.001, quantity: 12 },
            { city: "Lyon", cat: "B", price: 4.2, quantity: 4.2 }
        ]
        assert.deepEqual(multipleFiltersData(arrayOfObj, {city: ["Rennes", "Lille"], cat: ["A"]}), [{city: "Rennes", cat: "A", price: "5", quantity: 2}, {city: "Lille", cat: "A", price: "2", quantity: 3}, { city: "Lille", cat: "A", price: 2.03, quantity: 5}])
    })
    it("Should be able to return the array filtered on max field value", function() {
        const arrayOfObj = [
            { city: "Rennes", cat: "A", price: "5", quantity: 2 },
            { city: "Rennes", cat: "B", price: 4, quantity: 1 },
            { city: "Rennes", cat: "B", price: 2.2, quantity: 20 },
            { city: "Lille", cat: "A", price: "2", quantity: 3 },
            { city: "Lille", cat: "A", price: 5, quantity: 5 },
            { city: "Lyon", cat: "A", price: 2.001, quantity: 12 },
            { city: "Lyon", cat: "B", price: 4.2, quantity: 4.2 }
        ]
        assert.deepEqual(multipleFiltersData(arrayOfObj, {city: ["Rennes", "Lille"], cat: ["A"], price: ["max{price}"]}), [{city: "Rennes", cat: "A", price: "5", quantity: 2}, { city: "Lille", cat: "A", price: 5, quantity: 5}])
    })
    it("Should be able to return the array filtered on min field value", function() {
        const arrayOfObj = [
            { city: "Rennes", cat: "A", price: "5", quantity: 2 },
            { city: "Rennes", cat: "B", price: 4, quantity: 1 },
            { city: "Rennes", cat: "B", price: 2.2, quantity: 20 },
            { city: "Lille", cat: "A", price: "2", quantity: 3 },
            { city: "Lille", cat: "A", price: 5, quantity: 5 },
            { city: "Lyon", cat: "A", price: 2.001, quantity: 12 },
            { city: "Lyon", cat: "B", price: 4.2, quantity: 4.2 }
        ]
        assert.deepEqual(multipleFiltersData(arrayOfObj, {city: ["Rennes", "Lille"], cat: ["A"], price: ["min{price}"]}), [{ city: "Lille", cat: "A", price: "2", quantity: 3}])
    })
    it("Should be able to return empty array if error in filters name", function() {
        const arrayOfObj = [
            { city: "Rennes", cat: "A", price: "5", quantity: 2 },
            { city: "Rennes", cat: "B", price: 4, quantity: 1 },
            { city: "Rennes", cat: "B", price: 2.2, quantity: 20 },
            { city: "Lille", cat: "A", price: "2", quantity: 3 },
            { city: "Lille", cat: "A", price: 5, quantity: 5 },
            { city: "Lyon", cat: "A", price: 2.001, quantity: 12 },
            { city: "Lyon", cat: "B", price: 4.2, quantity: 4.2 }
        ]
        assert.deepEqual(multipleFiltersData(arrayOfObj, {cities: ["Rennes", "Lille"], cat: ["A"]}), [])
    })
})

describe("data-operations | isInArray", function() {
    it("Should be able to return true if element is in array", function() {
        const array = [1, "2", "C", 4, 55.22, "1.08"]
        assert.strictEqual(isInArray("1.08", array), true)
    })
    it("Should be able to return false if value is in array but in different format", function() {
        const array = [1, "2", "C", 4, 55.22, "1.08"]
        assert.strictEqual(isInArray(1.08, array), false)
    })
})

describe("data-operations | isEmpty", function() {
    it("Should be able to return true if element is null", function() {
        const val = null
        assert.strictEqual(isEmpty(val), true)
    })
    it("Should be able to return true if element is undefined", function() {
        const val = undefined
        assert.strictEqual(isEmpty(val), true)
    })
    it("Should be able to return true if element is empty string", function() {
        const val = ""
        assert.strictEqual(isEmpty(val), true)
    })
    it("Should be able to return true if element is an empty array", function() {
        const val = []
        assert.strictEqual(isEmpty(val), true)
    })
    it("Should be able to return false if element is an empty array containing empty string", function() {
        const val = [""]
        assert.strictEqual(isEmpty(val), false)
    })
})

describe("data-operations | isObject", function() {
    it("Should be able to return false if element is object", function() {
        const obj = { a: 'foo', b: 42, c: { toto: 'bidule', y: 13 } }
        assert.strictEqual(isObject(obj), true)
    })
    it("Should be able to return false if element is array", function() {
        const array = [1, 2, 3]
        assert.strictEqual(isObject(array), false)
    })
    it("Should be able to return false if element is array of objects", function() {
        const arrayOfObj = [
            { city: "Rennes", cat: "A", price: "5", quantity: 2 },
            { city: "Rennes", cat: "B", price: 4, quantity: 1 }
        ]
        assert.strictEqual(isObject(arrayOfObj), false)
    })
})

describe("data-operations | objToQueryString", function() {
    it("Should be able to return a string concatenated from object", function() {
        const obj = { param1: "Toto", param2: "Rennes" }
        assert.strictEqual(objToQueryString(obj), "param1=Toto&param2=Rennes")
    })
})

describe("data-operations | extractBrackets", function() {
    it("Should be able to return a string concatenated from object", function() {
        let params = { param1: "{test}", param2: "58" }
        let objRes = { test: "Youhou", test1: "Toto" }
        extractBrackets(params, objRes)
        assert.deepEqual(params, {param1: "Youhou", param2: "58"})
    })
})