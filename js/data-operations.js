'use strict';

import { evaluate } from 'mathjs'

/**
 * @desc Trie un objet (croissant ou décroissant) sur une colonne - s'exécute dans Array.prototype.sort()
 *
 * @param {String} field - Champ de l'objet sur lequel on souhaite trier
 * @param {Boolean} reverse - True : descendant / false : ascendant
 * @param {Function} primer - Facultatif : apprêt (par exemple forcer le type entier avec parseInt)
 *
 * @returns {Array.<Object>} Retourne l'objet trié
 */
const sortBy = (field, reverse, primer) => {
    let key = primer ?
        function (x) { return primer(x[field]) } :
        function (x) { return x[field] }
    reverse = !reverse ? 1 : -1
    return function (a, b) {
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a))
    }
}

/**
 * @desc Groupe un objet sur une colonne sans agrégation
 *
 * @param {Array.<Object>} object - Objet à grouper
 * @param {String} field - Champ de l'objet sur lequel on souhaite grouper
 *
 * @returns {Array.<Object>} Retourne l'objet groupé sans agrégat
 */
const groupBy = (object, field) => {
    const group = {}
    object.forEach(function (item) {
        const list = group[item[field]]
        if (list) {
            list.push(item)
        } else {
            group[item[field]] = [item]
        }
    })
    return group
}

/**
 * @desc Groupe un objet sur une colonne et agrégat des valeurs d'une (autre colonne)
 *
 * @param {Array.<Object>} object - Objet à grouper
 * @param {String} colGroupBy - Champ de l'objet sur lequel on souhaite grouper
 * @param {String} valSum - Champ de l'objet sur lequel on souhaite sommer
 *
 * @returns {Array.<Object>} Retourne l'objet groupé et agrégé
 */
const groupBySum = (object, colGroupBy, valSum) => {
    const result = [...object.reduce((r, o) => {
        const key = o[colGroupBy]
        const item = r.get(key) || Object.assign({}, o, {
            [valSum]: 0
        })
        item[valSum] += +o[valSum]
        return r.set(key, item)
    }, new Map).values()]
    return result
}

/**
 * @desc Groupe un objet sur plusieurs colonnes et agrégat des valeurs de plusieurs colonnes
 *
 * @param {Array.<Object>} object - Objet à grouper
 * @param {Array} groupKeys - Liste des champs de l'objet sur lesquels on souhaite grouper
 * @param {Array} sumKeys - Liste des champs de l'objet sur lesquels on souhaite sommer
 *
 * @returns {Array.<Object>} Retourne l'objet groupé et agrégé
 */
const multipleGroupBySum = (object, groupKeys, sumKeys) => {
    if (typeof groupKeys === 'string') {
        groupKeys = [groupKeys]
    }
    const sumKeysClean = sumKeys.filter(item => !groupKeys.includes(item))
    return Object.values(
        object.reduce((acc, curr) => {
            const group = groupKeys.map(k => curr[k]).join('-')
            acc[group] = acc[group] || Object.fromEntries(
                groupKeys.map(k => [k, curr[k]]).concat(sumKeysClean.map(k => [k, 0])))
            sumKeysClean.forEach(k => acc[group][k] += Number(curr[k]))
            return acc
        }, {})
    )
}

/**
 * @desc Arrondir une valeur
 *
 * @param {Number} value - Valeur à arrondir
 * @param {Number} decimals - Nombre de décimales en sortie
 *
 * @returns {Number} Retourne le nombre arrondi
 */
const roundDec = (value, decimals) => {
    return +(Math.round(Number(value) + 'e' + decimals) + 'e-' + decimals)
}

/**
 * @desc Obtenir la valeur maximale d'une colonne d'un objet
 *
 * @param {Array.<Object>} data - Objet
 * @param {String} column - Champ de l'objet sur lequel on souhaite obtenir le maximum 
 *
 * @returns {Number} Retourne la valeur maximale
 */
const getMax = (data, column) => {
    return Math.max.apply(
        Math, data.map(
            function (o) {
                return o[column]
            }
        )
    )
}

/**
 * @desc Obtenir la valeur minimale d'une colonne d'un objet
 *
 * @param {Array.<Object>} data - Objet
 * @param {String} column - Champ de l'objet sur lequel on souhaite obtenir le minimum 
 * @param {Boolean} excludeZero - True : ignorer les valeurs égales à zéro - false : les prendre en compte
 *
 * @returns {Number} Retourne la valeur minimale
 */
const getMin = (data, column, excludeZero) => {
    let a = []
    if (excludeZero === false) {
        a = data
    } else {
        data.map(function (o) {
            if (o[column] > 0) {
                a.push(o)
            }
        })
    }
    return Math.min.apply(Math, a.map(function (o) {
        return o[column]
    }))
}

/**
 * @desc Filtrer un objet selon plusieurs colonnes et valeurs
 *
 * @param {Array.<Object>} data - Objet
 * @param {Object} filters - Les filtres à appliquer - ex. : {'field': ['value1', 'value2'], 'other_field': ['value']}
 * @tips les filtres équivalent à "égal à", il est également possible d'obtenir le max ou le min : {'field': [max{field}]} ou {'field': [min{field}]}
 * {@link https://gist.github.com/jherax/f11d669ba286f21b7a2dcff69621eb72}
 * 
 * @returns {Array.<Object>} Retourne l'objet filtré
 */
const multipleFiltersData = (data, filters) => {
    const filterKeys = Object.keys(filters)
    return data.filter(function (eachObj) {
        return filterKeys.every(function (eachKey) {
            if (!filters[eachKey]) {
                return true
            }
            const customFilters = []
            if (Array.isArray(filters[eachKey])) {
                filters[eachKey].forEach(function (e) {
                    if (typeof (e) === 'string' && e.slice(0, 3) === 'max') {
                        const colMax = e.match(/{(.*?)}/)
                        if (colMax.length) {
                            let maxVal = getMax(data, colMax[1])
                            if (e.slice(e.lastIndexOf('}') + 1)) {
                                maxVal = evaluate(maxVal + e.slice(e.lastIndexOf('}') + 1))
                            } else {
                                maxVal
                            }
                            customFilters.push(String(maxVal))
                        }
                    }
                    else if (typeof (e) === 'string' && e.slice(0, 3) === 'min') {
                        const colMin = e.match(/{(.*?)}/)
                        if (colMin.length) {
                            let minVal = getMin(data, colMin[1])
                            if (e.slice(e.lastIndexOf('}') + 1)) {
                                minVal = evaluate(minVal + e.slice(e.lastIndexOf('}') + 1))
                            } else {
                                minVal
                            }
                            customFilters.push(String(minVal))
                        }
                    }
                })
            }
            if (!customFilters.length) {
                return (filters[eachKey].toString()).includes((eachObj[eachKey].toString()))
            } else {
                return (customFilters.toString()).includes((eachObj[eachKey].toString()))
            }
        })
    })
}

/**
 * @desc Détermine si une valeur est présente dans l'array
 *
 * @param {(Number|String)} value - Valeur que l'on souhaite trouver
 * @param {Array} array - Array : liste des valeurs
 *
 * @returns {Boolean} Retourne true si la valeur est présente dans l'array
 */
const isInArray = (value, array) => {
    return array.indexOf(value) > -1
}

/**
 * @desc Détermine si le champ est vide
 *
 * @param {*} value - Valeur que l'on souhaite vérifier
 *
 * @returns {Boolean} Retourne true si le champ est vide
 */
const isEmpty = (value) => {
    return (value == null || value.length === 0)
}

/**
 * @desc Détermine si l'entrée est un objet
 *
 * @param {*} x - Valeur que l'on souhaite vérifier
 *
 * @returns {Boolean} Retourne true si x est un objet
 */
const isObject = (x) => {
    return Object.prototype.toString.call(x) === '[object Object]'
}

const objToQueryString = (obj) => {
    const keyValuePairs = []
    for (const key in obj) {
        keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
    }
    return keyValuePairs.join('&')
}

export { sortBy, groupBy, groupBySum, multipleGroupBySum, roundDec, getMax, getMin, multipleFiltersData, isInArray, isEmpty, isObject, objToQueryString }