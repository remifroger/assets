'use strict';

import domtoimage from 'dom-to-image'
import 'blueimp-canvas-to-blob'
import alasql from 'alasql'
import saveAs from 'file-saver'
import { hideChildrenFromEl, showChildrenFromEl } from './navigation.js'

/**
 * @desc Transforme et exporte des données en CSV 
 * @see {@link https://github.com/agershun/alasql/wiki/Csv|AlaSQL}
 *
 * @param {Array.<Object>} data - L'objet à télécharger
 * 
 * @returns {Promise} Retourne une promesse
 */
const saveFileXlsx = (data) => {
    data.map(function (obj) { // boucle sur data (array of objects)
        for (const key in obj) { // bouche sur chaque clé d'objet
            if (typeof obj[key] === 'string') { // seulement sur type string
                obj[key] = obj[key].replace('.', ',') // on remplace les '.' par des ',' pour permettre un typage correct des colonnes sur Excel	  
            }
        }
        return obj
    })
    return alasql('SELECT * INTO CSV("data-download.csv", { headers: true }) FROM ?', [data])
}

/**
 * @desc Exporte en PNG un élément du DOM 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob|HTMLCanvasElement.toBlob()}
 *
 * @param {String} target - Elément du DOM à imprimer
 * @param {String} template - Template HTML à afficher pour l'impression
 * 
 * @returns {Promise} Retourne une promesse
 */
const printDomElement = (target, template) => {
    document.querySelectorAll(target).forEach((item) => {
        if (document.getElementById('loading-modal')) {
            $("#loading-modal").modal({
                backdrop: "static",
                keyboard: false,
                show: true
            })
        }
        if (item.querySelector('.footer-chart')) {
            item.querySelector('.footer-chart').style.display = "none"
        }
        if (item.querySelector('.control-map .map-analyses-select')) {
            hideChildrenFromEl(item.querySelector('.control-map .map-analyses-select'))
        }
        if (item.querySelector('.bloc-stat')) {
            if (item.querySelector('.bloc-stat').querySelector("#map")) {
                item.querySelector('.bloc-stat').insertAdjacentHTML('beforeend', "<div class='legend-print-content'></div>")
            }
            item.querySelector('.bloc-stat').insertAdjacentHTML('beforeend', "<div class='print-infos'></div>") // on ajoute un bloc juste pour l'impression, qui contiendra des informations
        }
        const today = new Date()
        const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' } // récupération d'informations sur la date
        if (item.querySelector('.print-infos')) {
            const el = item.querySelector('.print-infos')
            while (el.firstChild) el.removeChild(el.firstChild)
            el.style.display = "block"
            el.insertAdjacentHTML('beforeend', "<div class='mt-2'>Date d'impression : " + today.toLocaleDateString('fr-CA', optionsDate) + "</div>")
            if (template) {
                el.insertAdjacentHTML('beforeend', template)
            }
        }
        domtoimage.toBlob(item)
            .then(function (blob) {
                window.saveAs(blob, 'print-' + target + '.png')
                $("#loading-modal").modal('hide')
                if (item.querySelector('.print-infos')) item.querySelector('.print-infos').style.display = "none"
                if (item.querySelector('.legend-print-content')) item.querySelector('.legend-print-content').style.display = "none"
                if (item.querySelector('.footer-chart')) item.querySelector('.footer-chart').style.display = ""
                if (item.querySelector('.control-map .map-analyses-select')) showChildrenFromEl(item.querySelector('.control-map .map-analyses-select'))
            })
            .catch(function (error) {
                console.error(error)
            })
    })
}

export { saveFileXlsx, printDomElement }