'use strict';

import { Fill, Stroke, Circle, Style } from 'ol/style'

/**
 * @desc Applique un style polygone
 *
 * @param {String} strokeColor - Couleur du contour
 * @param {String} strokeWidth - Epaisseur du contour
 * @param {String} fillColor - Couleur du fond
 * 
 * @returns {Object} Retourne le style
 */
const stylePolygon = (strokeColor, strokeWidth, fillColor) => {
    return new Style({
        stroke: new Stroke({ color: strokeColor, width: strokeWidth }),
        fill: new Fill({ color: fillColor })
    })
}

/**
 * @desc Applique un style cercle
 *
 * @param {String} radiusValue - Rayon du cercle
 * @param {String} strokeColor - Couleur du contour
 * @param {String} strokeWidth - Epaisseur du contour
 * @param {String} fillColor - Couleur du fond
 * 
 * @returns {Object} Retourne le style
 */
const styleCircle = (radiusValue, strokeColor, strokeWidth, fillColor) => {
    return new Style({
        image: new Circle({
            radius: radiusValue,
            fill: new Fill({ color: fillColor }),
            stroke: new Stroke({ color: strokeColor, width: strokeWidth })
        })
    })
}

/**
 * @desc Crée la légende d'une analyse
 *
 * @param {String} target - Elément du DOM pointant sur le contenu de la légende
 * @param {Object} analyseLegendeText - Objet contenant la légende (pour analyse1 nouvelle déclaration de la classe analyse : analyse1.legendeProperties)
 * 
 * @returns {Function} Retourne la légende rendue
 */
const createLegend = (target, analyseLegendeText) => {
    for (const el of document.querySelectorAll(target)) el.style.display = "block"
    document.querySelector(target).insertAdjacentHTML('beforeend', "<div class='legend-title text-muted'>" + analyseLegendeText.options.title + "</div><hr>")
    const legendContent = analyseLegendeText.legendeProperties
    if (legendContent != undefined) {
        if (analyseLegendeText.options.type.mode === 'Cercle') {
            legendContent.legende.forEach((elm, i) => {
                document.querySelector(target).insertAdjacentHTML('beforeend', "<div class='legend'><div class='color-legende' style='background-color: " + legendContent.legende[i].color_fill + "; width: " + legendContent.legende[i].val + "px; height: " + legendContent.legende[i].val + "px; border-radius: 50%; border: 2px solid " + legendContent.legende[i].color_stroke + "'></div><div class='val-legende'>" + legendContent.legende[i].text_legende + "</div></div>")
            })
        }
        if (analyseLegendeText.options.type.mode === 'Polygone') {
            legendContent.legende.forEach((elm, i) => {
                document.querySelector(target).insertAdjacentHTML('beforeend', "<div class='legend'><div class='color-legende' style='background-color:" + legendContent.legende[i].color_fill + "; width: 15px; height: 15px; border-radius: 4px;'></div><div class='val-legende'>" + legendContent.legende[i].text_legende + "</div></div>")
            })
        }
    }
    else {
        return null
    }
}

export { stylePolygon, styleCircle, createLegend }