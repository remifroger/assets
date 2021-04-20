'use strict';

/**
 * @desc Options du fond de carte MapBox
 * @typedef {Object} mapBox
 * 
 * @property {String} url - Lien du flux 
 * @property {String} attribution - Attributions
 */
const mapBox = {
    url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZWFzeXJldGFpbCIsImEiOiJjamtsOTV2d3AwNWllM3FvbDdlMHh1NmQxIn0.b1y8VvowjwZIhfwt2JEPPw',
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>'
}

/**
 * @desc Options du fond de carte CARTO
 * @typedef {Object} cartoPositron
 * 
 * @property {String} url - Lien du flux 
 * @property {String} attribution - Attributions
 */
const cartoPositron = {
    url: 'https://{1-4}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}

/**
 * @desc Options du fond de carte dark
 * @typedef {Object} cartoPositron
 * 
 * @property {String} url - Lien du flux 
 * @property {String} attribution - Attributions
 */
const dark = {
    url: 'https://{1-4}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}

export { mapBox, cartoPositron, dark }