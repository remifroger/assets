'use strict';

import { multipleFiltersData, getMax, isEmpty, isObject, roundDec, multipleGroupBySum } from './data-operations.js'
import { saveFileXlsx, printDomElement } from './exports.js'
import { styleCircle, stylePolygon, createLegend } from './map-custom-style.js'
import { ckmeans } from 'simple-statistics'
import Overlay from 'ol/Overlay'
import { displayFeatureInfo } from './map-interaction.js'
import { getAllUrlParameters } from './navigation.js'

/**
 * @desc Vérifie la validité des options configurées pour générer une analyse cartographique
 *
 * @param {Object} options - Options du graphique à vérifier
 * @param {String} options.theme - Nom du thème de l'analyse
 * @param {String} options.title - Titre de l'analyse
 * @param {String} options.dateCol - Formatage d'une valeur d'une colonne des données à ajouter à la suite du titre (ex. : 'en {numero_annee}' affichera directement la valeur de la colonne {numero_annee})
 * @param {('Cercle'|'Polygone')} options.type.mode - Type d'analyse
 * @param {('Quantitatif'|'Qualitatif')} options.type.methode - Méthode d'analyse
 * @param {?Array.<Object>} options.type.qualitatifObj - Légende pour les analyses qualitatives
 * @param {?Array} options.type.qualitatifObj[].val - Liste des valeurs
 * @param {?String} options.type.qualitatifObj[].text_legende - Texte de légende
 * @param {?String} options.type.qualitatifObj[].color_stroke - Couleur de fond
 * @param {?Number} options.type.qualitatifObj[].stroke_width - Epaisseur du contour
 * @param {?String} options.type.qualitatifObj[].color_fill - Couleur du contour
 * @param {String} options.data.layer - Nom de la couche géographique (flux GeoServer déclaré avec OpenLayers -> layer.get('name'))
 * @param {('Externe'|'Interne')} options.data.source - Origine de la donnée ('Interne' signifie qu'on utilise les données options.daya.layer)
 * @param {?String} options.data.sourceUrl - URL du flux externe - doit retourner une liste d'objets {Array.<Object>}
 * @param {?Object} options.data.params - Paramètres à appliquer au flux de données, pour réutiliser la valeur d'un paramètre de l'URL courante : {"monParam": "{monParam}", "monParam2": "{monParam2}"}
 * @param {Number} options.data.index - Index du flux de données (de type {Array.<Object>}) à utiliser
 * @param {?String} options.data.geoCol - Champ de jointure du flux externe
 * @param {String} options.data.geoColBasemap - Champ de jointure du flux géographique GeoServer
 * @param {Object} options.data.customFilters - Filtres à appliquer (voir multipleFiltersData)
 * @param {?String} options.data.groupBy - Colonne de groupement (avec agrégat sur options.mesure)
 * @param {String} options.mesure - Colonne référençant la mesure d'analyse
 * @param {?String} options.exceptions.label - Champ à afficher (par exemple on souhaite affiche le nom de la commune 'lib_geo' devant la valeur ignorée)
 * @param {?Array} options.exceptions.val - Entités à ignorer (valeurs extrêmes) - indiquer le.s valeur.s correspondant au champde jointure options.data.geoCol
 * @param {String} options.blocMapTarget - Elément du DOM pointant sur le bloc d'analyses
 * @param {String} options.selectTarget - Elément du DOM pointant sur le sélecteur d'analyses
 * @param {String} options.legendTarget - Elément du DOM pointant sur le contenu de la légende
 * @param {String} options.downloadButtonTarget - Elément du DOM pointant vers le bouton (ou lien) de téléchargement des données
 * @param {String} options.printButtonTarget - Elément du DOM pointant vers le bouton (ou lien) d'impression du graphique
 * 
 * @returns {Boolean} Retourne true si l'objet est valide
 */
const mapOptionsChecker = (options) => {
    const mode = ['Cercle', 'Polygone']
    const methode = ['Quantitatif', 'Qualitatif']
    const source = ['Externe', 'Interne']

    const getkeys = (obj, prefix) => {
        const keys = Object.keys(obj)
        prefix = prefix ? prefix + '.' : ''
        return keys.reduce(function (result, key) {
            if (isObject(obj[key]) && key !== 'options' && key !== 'qualitatifObj' && key !== 'customFilters' && key !== 'params') {
                result = result.concat(getkeys(obj[key], prefix + key))
            } else {
                result.push(prefix + key)
            }
            return result
        }, [])
    }

    const optionsKeysCorrectFormat = ["theme", "title", "dateCol", "type.mode", "type.methode", "type.qualitatifObj", "data.layer", "data.source", "data.sourceUrl", "data.params", "data.index", "data.geoCol", "data.geoColBasemap", "data.customFilters", "data.groupBy", "mesure", "exceptions.label", "exceptions.val", "blocMapTarget", "selectTarget", "legendTarget", "downloadButtonTarget", "printButtonTarget"]
    const optionsKeysToCheck = getkeys(options)

    if (JSON.stringify(optionsKeysCorrectFormat) === JSON.stringify(optionsKeysToCheck)) {
        if (options.theme) {
            // options.theme doit être string et ne peut être null
            if (typeof options.theme !== 'string') {
                console.log('[' + options.title + '] options.theme doit être au format string')
                return
            }
        }
        if (isEmpty(options.theme)) {
            console.log('[' + options.title + '] options.theme ne peut être null')
            return
        }
        // options.title doit être string et ne peut être null
        if (options.title) {
            if (typeof options.title !== 'string') {
                console.log('[' + options.title + '] options.title doit être au format string')
                return
            }
        }
        if (isEmpty(options.title)) {
            console.log('[' + options.title + '] options.title ne peut être null')
            return
        }
        // options.dateCol doit être string ou null
        if (options.dateCol) {
            if (typeof options.dateCol !== 'string') {
                console.log('[' + options.title + '] options.dateCol doit être au format string')
                return
            }
            if (typeof options.dateCol === 'string' && !(options.dateCol.includes("{"))) {
                console.log('[' + options.title + '] options.dateCol : la letiable correspondant à la temporalité du flux de données doit être indiqué entre "{}"')
                return
            }
        }
        // options.type.mode doit être string et ne peut être null
        if (options.type.mode) {
            if (typeof options.type.mode !== 'string') {
                console.log('[' + options.title + '] options.type.mode doit être au format string')
                return
            }
            if (!mode.includes(options.type.mode)) {
                console.log('[' + options.title + '] Le mode d\'analyse ' + options.type.mode + ' n\'est pas supporté')
                return
            }
        }
        if (isEmpty(options.type.mode)) {
            console.log('[' + options.title + '] options.type.mode ne peut être null')
            return
        }
        // options.type.methode doit être string et ne peut être null
        if (options.type.methode) {
            if (typeof options.type.methode !== 'string') {
                console.log('[' + options.title + '] options.type.methode doit être au format string')
                return
            }
            if (!methode.includes(options.type.methode)) {
                console.log('[' + options.title + '] La méthode d\'analyse ' + options.type.methode + ' n\'est pas supportée')
                return
            }
            if (options.type.methode === 'Qualitatif') {
                if (options.type.qualitatifObj == null) {
                    console.log('[' + options.title + '] Si la méthode est qualitative, options.type.methode ne peut être null doit être utilisé selon le format [{ "val": ["val"], "text_legende": "val", "color_stroke": "val", "stroke_width": "val", "color_fill": "val" }, {...}]')
                    return
                }
            }
        }
        if (isEmpty(options.type.methode)) {
            console.log('[' + options.title + '] options.type.methode ne peut être null')
            return
        }
        // options.type.qualitatif doit être un objet ou null
        if (options.type.qualitatifObj) {
            if (typeof options.type.qualitatifObj !== 'object') {
                console.log('[' + options.title + '] options.type.qualitatifObj doit être un objet ou null')
                return
            }
        }
        // options.data.layer doit être string et ne peut être null
        if (options.data.layer) {
            if (typeof options.data.layer !== 'string') {
                console.log('[' + options.title + '] options.data.layer doit être au format string')
                return
            }
        }
        if (isEmpty(options.data.layer)) {
            console.log('[' + options.title + '] options.data.layer ne peut être null')
            return
        }
        // options.data.source doit être string et ne peut être null
        if (options.data.source) {
            if (typeof options.data.source !== 'string') {
                console.log('[' + options.title + '] options.data.source doit être au format string')
                return
            }
            if (!source.includes(options.data.source)) {
                console.log('[' + options.title + '] Le type de source ' + options.data.source + ' n\'est pas supporté')
                return
            }
            if (options.data.source === 'Externe') {
                // si 'Externe', options.data.sourceUrl ne peut être null
                if (isEmpty(options.data.sourceUrl)) {
                    console.log('[' + options.title + '] options.data.sourceUrl ne peut être null')
                    return
                }
            }
            if (options.data.source === 'Interne') {
                // si 'Interne', options.data.sourceUrl doit être null
                if (!isEmpty(options.data.sourceUrl)) {
                    console.log('[' + options.title + '] options.data.sourceUrl doit être null car options.data.source === "Interne"')
                    return
                }
            }
        }
        if (isEmpty(options.data.source)) {
            console.log('[' + options.title + '] options.data.source ne peut être null')
            return
        }
        //options.data.sourceUrl doit être string ou null
        if (options.data.sourceUrl) {
            if (typeof options.data.sourceUrl !== 'string') {
                console.log('[' + options.title + '] options.data.sourceUrl doit être de type string ou null')
                return
            }
        }
        // options.data.params doit être un objet et ne peut être null
        if (options.data.params) {
            if (!isObject(options.data.params)) {
                console.log('[' + options.title + '] options.data.params doit être un objet')
                return
            }
        }
        if (isEmpty(options.data.params)) {
            console.log('[' + options.title + '] options.data.params ne peut être null, mais l\'objet peut être vide')
            return
        }
        // options.data.index peut être string, integer ou null
        if (options.data.index) {
            if (typeof options.data.index == undefined) {
                console.log('[' + options.title + '] options.data.index doit être de type string, integer ou null')
                return
            }
        }
        // options.data.geoCol doit être de type string
        if (options.data.geoCol) {
            if (typeof options.data.geoCol !== 'string') {
                console.log('[' + options.title + '] options.data.geoCol doit être de type string')
                return
            }
        }
        // options.data.geoCol ne peut être null
        if (isEmpty(options.data.geoCol)) {
            console.log('[' + options.title + '] options.data.geoCol ne peut être null')
            return
        }
        // options.data.geoColBasemap doit être de type string
        if (options.data.geoColBasemap) {
            if (typeof options.data.geoColBasemap !== 'string') {
                console.log('[' + options.title + '] options.data.geoColBasemap doit être de type string')
                return
            }
        }
        // options.data.geoColBasemap ne peut être null
        if (isEmpty(options.data.geoColBasemap)) {
            console.log('[' + options.title + '] options.data.geoColBasemap ne peut être null')
            return
        }
        // options.data.customFilters doit être un objet et ne peut être null
        if (options.data.customFilters) {
            if (!isObject(options.data.customFilters)) {
                console.log('[' + options.title + '] options.data.customFilters doit être un objet')
                return
            }
        }
        if (isEmpty(options.data.customFilters)) {
            console.log('[' + options.title + '] options.data.customFilters ne peut être null, mais l\'objet peut être vide')
            return
        }
        // options.data.groupBy doit être de type string et peut être null
        if (options.data.groupBy) {
            if (!Array.isArray(options.data.groupBy)) {
                console.log('[' + options.title + '] options.data.groupBy doit être de type array ou null')
                return
            }
        }
        // options.mesure doit être de type string et ne peut être null
        if (options.mesure) {
            if (typeof options.mesure !== 'string') {
                console.log('[' + options.title + '] options.mesure doit être de type string')
                return
            }
        }
        if (isEmpty(options.mesure)) {
            console.log('[' + options.title + '] options.mesure ne peut être null')
            return
        }
        // options.exceptions.label peut être un string ou null
        if (options.exceptions.label) {
            if (typeof options.exceptions.label !== 'string') {
                console.log('[' + options.title + '] options.exceptions.label doit être au format string ou null')
                return
            }
            if (options.exceptions.val.length === 0) {
                console.log('[' + options.title + '] Si options.exceptions.label est renseigné, indiquez au moins une valeur d\'exception dans options.exceptions.val')
                return
            }
        }
        // options.exceptions.val doit être de type array
        if (options.exceptions.val) {
            if (!Array.isArray(options.exceptions.val)) {
                console.log('[' + options.title + '] options.exceptions.val doit être de type array')
                return
            }
        }
        // options.blocMapTarget doit être string et ne peut être null
        if (options.blocMapTarget) {
            if (typeof options.blocMapTarget !== 'string') {
                console.log('[' + options.title + '] options.blocMapTarget doit être au format string')
                return
            }
            if (!document.querySelector(options.blocMapTarget)) {
                console.log('[' + options.title + '] options.blocMapTarget n\'existe pas')
                return
            }
        }
        if (isEmpty(options.blocMapTarget)) {
            console.log('[' + options.title + '] options.blocMapTarget ne peut être null')
            return
        }
        // options.legendTarget doit être string et ne peut être null
        if (options.legendTarget) {
            if (typeof options.legendTarget !== 'string') {
                console.log('[' + options.title + '] options.legendTarget doit être au format string')
                return
            }
            if (!document.querySelector(options.blocMapTarget)) {
                console.log('[' + options.title + '] options.legendTarget n\'existe pas')
                return
            }
        }
        if (isEmpty(options.blocMapTarget)) {
            console.log('[' + options.title + '] options.legendTarget ne peut être null')
            return
        }
        // options.selectTarget doit être string et ne peut être null
        if (options.selectTarget) {
            if (typeof options.selectTarget !== 'string') {
                console.log('[' + options.title + '] options.selectTarget doit être au format string')
                return
            }
            if (!document.querySelector(options.selectTarget)) {
                console.log('[' + options.title + '] options.selectTarget n\'existe pas')
                return
            }
        }
        if (isEmpty(options.selectTarget)) {
            console.log('[' + options.title + '] options.selectTarget ne peut être null')
            return
        }
        // options.downloadButtonTarget peut être string ou null
        if (options.downloadButtonTarget) {
            if (typeof options.downloadButtonTarget !== 'string') {
                console.log('[' + options.title + '] options.downloadButtonTarget doit être au format string')
                return
            }
            if (!document.querySelector(options.downloadButtonTarget)) {
                console.log('[' + options.title + '] options.downloadButtonTarget n\'existe pas')
                return
            }
        }
        // options.printButtonTarget peut être string ou null
        if (options.printButtonTarget) {
            if (typeof options.printButtonTarget !== 'string') {
                console.log('[' + options.title + '] options.printButtonTarget doit être au format string')
                return
            }
            if (!document.querySelector(options.printButtonTarget)) {
                console.log('[' + options.title + '] options.printButtonTarget n\'existe pas')
                return
            }
        }
        return true
    } else {
        console.log('[' + ((options.title) ? (options.title) : 'options.title n\'est pas renseigné') + '] Le format des options de l\'analyse cartographique est incorrect, une ou plusieurs options sont manquantes')
        return false
    }
}

/** @global Liste des analyses cartographiques instanciées */
let globalAnalyzes = []

/** 
 * Classe représentant une analyse cartographique 
 */
class MapAnalysis {
    /**
     * @desc Créer une analyse cartographique
     * 
     * @param {String} id - Identifiant
     * @param {Object} legendeProperties - Légende de l'analyse (structure différente selon typeGeom)
     * @param {Object} options - Options du graphique (voir optionsChecker) 
      */
    constructor(id, options) {
        this.id = id
        this.legendeProperties
        this.options = options
        globalAnalyzes.push(this)
    }

    dataSourceOperations(data, dataLayers) {
        let dataObj // Array of objects
        const options = this.options
        if (options.data.source === 'Externe') {
            // If data comes from external source (JSON response from AJAX call with options.data.sourceUrl and options.data.params)
            // Check if data comes from a standard JSON API result (res['data']), see: https://jsonapi.org/
            if (data['data']) {
                // If an index is specified, go through it and store the result into dataObj
                if (options.data.index !== null) {
                    if (data['data'][options.data.index]) {
                        dataObj = data['data'][options.data.index]
                    }
                } else {
                    // Else, just store the data property into dataObj
                    if (data['data']) {
                        dataObj = data['data']
                    }
                }
            } else {
                // If it's not a standard JSON API, try to find data through the root object
                // // If an index is specified, go through it and store the result into dataObj
                if (options.data.index !== null) {
                    if (data[options.data.index]) {
                        dataObj = data[options.data.index]
                    }
                } else {
                    // Else, if exists, try to store the root object
                    if (data) {
                        dataObj = data
                    }
                }
            }
        } else if (options.data.source === 'Interne') {
            // If data comes from internal source (JSON response from AJAX call with options.data.sourceUrl and options.data.params)
            if (dataLayers) {
                dataObj = dataLayers
            }
        } else {
            console.log('La source de données est incorrecte pour ' + options.title)
            document.querySelector(options.blocMapTarget).childNodes[0].insertAdjacentHTML('beforeend', '<div class="alert-infos mt-3"><div class="alert alert-dark" role="alert">' + options.title + ' : données non disponibles</div></div>')
        }
        if (dataObj) {
            // If options.data.customFilters isn't empty, apply filters and reassign the result to dataObj
            if (Object.keys(options.data.customFilters).length > 0) {
                dataObj = multipleFiltersData(dataObj, options.data.customFilters)
                if (options.data.groupBy) {
                    dataObj = multipleGroupBySum(dataObj, options.data.groupBy, [options.mesure])
                }
            }
            // If options.data.groupBy, apply the group on the property and sum on options.mesure
            else if (options.data.groupBy) {
                dataObj = multipleGroupBySum(dataObj, options.data.groupBy, [options.mesure])
            }
            else {
                dataObj
            }
        }
        if (isEmpty(dataObj) || dataObj == undefined) {
            // If dataObj is empty, remove the analysis according to the data from globalAnalyzes
            globalAnalyzes = globalAnalyzes.filter(function (e) { return e.options.title != options.title })
            document.querySelector(options.blocMapTarget).childNodes[0].insertAdjacentHTML('beforeend', '<div class="alert-infos mt-3"><div class="alert alert-dark" role="alert">' + options.title + ' : données non disponibles</div></div>')
            return
        } else {
            return dataObj
        }
    }

    /**
     * @desc Construct cartographic analysis legend
     *
     * @param {Array.<Object>} data - Data object
     * 
     * @returns {Function} Return the legend
     */
    cartoClassification(data) {
        const options = this.options
        const unique = (value, index, self) => {
            return self.indexOf(value) === index
        }
        if (options.type.mode === "Cercle") {
            if (options.type.methode === "Quantitatif") {
                const valMax = getMax(data, options.mesure)
                const radius = 50 / valMax
                const colorStroke = "rgba(255, 255, 255, 0.1)"
                const colorFill = "rgba(46, 49, 49, 0.8)"
                return this.legendeProperties = {
                    radius: radius,
                    colorStroke: colorStroke,
                    colorFill: colorFill,
                    stroke: 1.5,
                    exceptions: options.exceptions.val,
                    exceptionsRadius: radius / 2,
                    exceptionsLabel: options.exceptions.label,
                    legende: [
                        { val: (radius * (valMax / 12)), text_legende: roundDec(valMax / 12, 0).toLocaleString(), color_fill: colorFill, color_stroke: colorStroke },
                        { val: (radius * (valMax / 8)), text_legende: roundDec(valMax / 8, 0).toLocaleString(), color_fill: colorFill, color_stroke: colorStroke },
                        { val: (radius * (valMax / 4)), text_legende: roundDec(valMax / 4, 0).toLocaleString(), color_fill: colorFill, color_stroke: colorStroke }
                    ]
                }
            }
            if (options.type.methode === "Qualitatif") {
                return this.legendeProperties = {
                    radius: 5,
                    colorStroke: null,
                    colorFill: null,
                    stroke: null,
                    exceptions: null,
                    exceptionsRadius: null,
                    exceptionsLabel: null,
                    legende: options.type.qualitatifObj
                }
            }
        }
        else if (options.type.mode === "Polygone") {
            if (options.type.methode === "Quantitatif") {
                const valStore = []
                let serie
                const bornes = []
                data.forEach((item) => {
                    if (item[options.mesure] !== null || item[options.mesure] !== undefined) {
                        valStore.push(item[options.mesure])
                    }
                })
                valStore.sort((a, b) => a - b)
                const minVal = Number(valStore[0]) - 1
                const maxVal = (valStore.slice(-1)[0] === 100) ? (valStore.slice(-1)[0]) : Number(valStore.slice(-1)[0]) + 1
                const uniqueValues = valStore.filter(unique)
                if (uniqueValues.length === 1) {
                    serie = ckmeans(uniqueValues, 1)
                    serie.forEach((item) => { bornes.push(item[0]) })
                    return this.legendeProperties = {
                        radius: null,
                        colorStroke: null,
                        colorFill: null,
                        stroke: null,
                        exceptions: null,
                        exceptionsRadius: null,
                        exceptionsLabel: null,
                        legende: [
                            { val: [minVal, maxVal], text_legende: "De " + roundDec(minVal, 1).toLocaleString() + " à " + roundDec(maxVal, 0).toLocaleString(), color_stroke: "rgba(255, 255, 255, 0.7)", stroke_width: 1.5, color_fill: "rgba(178, 24, 43, 0.7)" }
                        ]
                    }
                } else if (uniqueValues.length > 1 && uniqueValues.length <= 4) {
                    serie = ckmeans(uniqueValues, 2)
                    serie.forEach((item) => { bornes.push(item[0]) })
                    return this.legendeProperties = {
                        radius: null,
                        colorStroke: null,
                        colorFill: null,
                        stroke: null,
                        exceptions: null,
                        exceptionsRadius: null,
                        exceptionsLabel: null,
                        legende: [
                            { val: [bornes[1], maxVal], text_legende: "De " + roundDec(bornes[1], 1).toLocaleString() + " à " + roundDec(maxVal, 0).toLocaleString(), color_stroke: "rgba(255, 255, 255, 0.7)", stroke_width: 1.5, color_fill: "rgba(178, 24, 43, 0.7)" },
                            { val: [minVal, bornes[1]], text_legende: "De " + roundDec(minVal, 1).toLocaleString() + " à " + roundDec(bornes[1], 1).toLocaleString(), color_stroke: "rgba(255, 255, 255, 0.7)", stroke_width: 1.5, color_fill: "rgba(244, 165, 130, 0.5)" }
                        ]
                    }
                } else if (uniqueValues.length > 4 && uniqueValues.length <= 8) {
                    serie = ckmeans(uniqueValues, 3)
                    serie.forEach((item) => { bornes.push(item[0]) })
                    return this.legendeProperties = {
                        radius: null,
                        colorStroke: null,
                        colorFill: null,
                        stroke: null,
                        exceptions: null,
                        exceptionsRadius: null,
                        exceptionsLabel: null,
                        legende: [
                            { val: [bornes[2], maxVal], text_legende: "De " + roundDec(bornes[2], 1).toLocaleString() + " à " + roundDec(maxVal, 0).toLocaleString(), color_stroke: "rgba(255, 255, 255, 0.7)", stroke_width: 1.5, color_fill: "rgba(178, 24, 43, 0.7)" },
                            { val: [bornes[1], bornes[2]], text_legende: "De " + roundDec(bornes[1], 1).toLocaleString() + " à " + roundDec(bornes[2], 1).toLocaleString(), color_stroke: "rgba(255, 255, 255, 0.7)", stroke_width: 1.5, color_fill: "rgba(244, 165, 130, 0.5)" },
                            { val: [minVal, bornes[1]], text_legende: "De " + roundDec(minVal, 1).toLocaleString() + " à " + roundDec(bornes[1], 1).toLocaleString(), color_stroke: "rgba(255, 255, 255, 0.7)", stroke_width: 1.5, color_fill: "rgba(253, 219, 199, 0.4)" }
                        ]
                    }
                }
                else {
                    serie = ckmeans(uniqueValues, 6)
                    serie.forEach((item) => { bornes.push(item[0]) })
                    return this.legendeProperties = {
                        radius: null,
                        colorStroke: null,
                        colorFill: null,
                        stroke: null,
                        exceptions: null,
                        exceptionsRadius: null,
                        exceptionsLabel: null,
                        legende: [
                            { val: [bornes[5], maxVal], text_legende: "De " + roundDec(bornes[5], 1).toLocaleString() + " à " + roundDec(maxVal, 0).toLocaleString(), color_stroke: "rgba(255, 255, 255, 0.7)", stroke_width: 1.5, color_fill: "rgba(138, 15, 29, 0.7)" },
                            { val: [bornes[4], bornes[5]], text_legende: "De " + roundDec(bornes[4], 1).toLocaleString() + " à " + roundDec(bornes[5], 1).toLocaleString(), color_stroke: "rgba(255, 255, 255, 0.7)", stroke_width: 1.5, color_fill: "rgba(178, 24, 43, 0.7)" },
                            { val: [bornes[3], bornes[4]], text_legende: "De " + roundDec(bornes[3], 1).toLocaleString() + " à " + roundDec(bornes[4], 1).toLocaleString(), color_stroke: "rgba(255, 255, 255, 0.7)", stroke_width: 1.5, color_fill: "rgba(214, 96, 77, 0.6)" },
                            { val: [bornes[2], bornes[3]], text_legende: "De " + roundDec(bornes[2], 1).toLocaleString() + " à " + roundDec(bornes[3], 1).toLocaleString(), color_stroke: "rgba(255, 255, 255, 0.7)", stroke_width: 1.5, color_fill: "rgba(244, 165, 130, 0.5)" },
                            { val: [bornes[1], bornes[2]], text_legende: "De " + roundDec(bornes[1], 1).toLocaleString() + " à " + roundDec(bornes[2], 1).toLocaleString(), color_stroke: "rgba(255, 255, 255, 0.7)", stroke_width: 1.5, color_fill: "rgba(253, 219, 199, 0.4)" },
                            { val: [minVal, bornes[1]], text_legende: "De " + roundDec(minVal, 1).toLocaleString() + " à " + roundDec(bornes[1], 1).toLocaleString(), color_stroke: "rgba(255, 255, 255, 0.7)", stroke_width: 1.5, color_fill: "rgba(209, 229, 240, 0.4)" }
                        ]
                    }
                }
            }
            if (options.type.methode === "Qualitatif") {
                return this.legendeProperties = {
                    radius: null,
                    colorStroke: null,
                    colorFill: null,
                    stroke: null,
                    exceptions: null,
                    exceptionsRadius: null,
                    exceptionsLabel: null,
                    legende: options.type.qualitatifObj
                }
            }
        }
        else {
            console.log('Ce mode de représentation cartographique est incorrect')
        }
    }

    /**
     * @desc Construct cartographic analysis from legende
     *
     * @param {Array.<Object>} data - Data object
     * 
     * @returns {Function} Return the analysis style
     */
    buildStyle(data, map) {
        const legendeProp = this.legendeProperties
        const options = this.options
        const popup = new Overlay({
            element: document.getElementById('popup')
        })
        map.addEventListener("click", (evt) => {
            const mapClickFeature = displayFeatureInfo(evt.pixel, map, options.data.layer, options.data.geoColBasemap)
            const codeGeoSelect = []
            codeGeoSelect.push(mapClickFeature[0])
            const communeName = displayFeatureInfo(evt.pixel, map, options.data.layer, 'lib_com')
            if (communeName[0] !== undefined) {
                $('#commune-access-modal').modal()
                const elComName = document.querySelector('.commune-name')
                while (elComName.firstChild) elComName.removeChild(elComName.firstChild)
                elComName.insertAdjacentHTML('beforeend', '<b>' + communeName[0] + '</b> ?')
                if (document.querySelector('.insee-link')) document.querySelector('.insee-link').remove()
                const currentParams = getAllUrlParameters()
                currentParams['territoire'] = codeGeoSelect[0]
                currentParams['echelle'] = 'commune'
                document.querySelector('#commune-access-modal .go').addEventListener('click', () => {
                    window.location.href = window.location.href.split('?')[0] + '?' + Object.entries(currentParams).map(([key, val]) => `${key}=${val}`).join('&')
                })
            } else {
                console.log(options.title + ' : cette fonctionnalité fonctionne seulement avec les communes et un flux contenant un champ "lib_com"')
            }
        })
        map.addOverlay(popup)
        map.addEventListener('pointermove', (evt) => {
            let selected = null
            if (selected !== null) {
                selected = null
            }
            map.forEachFeatureAtPixel(evt.pixel, function (f) {
                selected = f
                return true
            }, {
                layerFilter: function (layer) {
                    return layer.get('name') === options.data.layer
                }
            })
            const element = popup.getElement()
            if (selected) {
                let valMesure
                if (multipleFiltersData(data, { [options.data.geoCol]: selected.get(options.data.geoColBasemap) }).length) {
                    valMesure = multipleFiltersData(data, { [options.data.geoCol]: selected.get(options.data.geoColBasemap) })[0][options.mesure]
                }
                const coordinate = evt.coordinate
                coordinate[1] += 50
                $(element).popover('dispose')
                popup.setPosition(coordinate)
                $(element).popover({
                    placement: 'top',
                    animation: false,
                    html: true,
                    content: `<div class="popup-style">Code : ${selected.get(options.data.geoColBasemap)}<br />${(selected.get('lib_com')) ? selected.get('lib_com') + '<br />' : ''}Valeur : ${(/^[0-9,.]*$/.test(valMesure)) ? roundDec(valMesure, 1) : valMesure}</div>`
                })
                $(element).popover('show')
            } else {
                $(element).popover('dispose')
            }
        })
        if (options.type.mode === 'Polygone') {
            return function (feature) {
                let styleAffected
                let dataFilterOnFeature
                dataFilterOnFeature = multipleFiltersData(data, { [options.data.geoCol]: feature.get(options.data.geoColBasemap) })[0]
                if (dataFilterOnFeature) {
                    if (options.type.methode === 'Quantitatif') {
                        legendeProp.legende.forEach((item) => {
                            if (Number(dataFilterOnFeature[options.mesure]) >= Number(item.val[0]) && Number(dataFilterOnFeature[options.mesure]) < Number(item.val[1])) {
                                return styleAffected = stylePolygon(item.color_stroke, item.stroke_width, item.color_fill)
                            }
                            else if (dataFilterOnFeature[options.mesure] === item.val[0] && dataFilterOnFeature[options.mesure] === null) { return styleAffected = stylePolygon(item.color_stroke, item.stroke_width, item.color_fill) }
                        })
                    }
                    if (options.type.methode === 'Qualitatif') {
                        legendeProp.legende.forEach((item) => {
                            if (dataFilterOnFeature[options.mesure] === item.val[0]) { return styleAffected = stylePolygon(item.color_stroke, item.stroke_width, item.color_fill) }
                        })
                    }
                    return styleAffected
                }
                else { return null }
            }
        } else if (options.type.mode === 'Cercle') {
            document.querySelector(options.legendTarget).insertAdjacentHTML('beforeend', '<div class="exceptions source-data bg-demo-light"><div>Valeur(s) exceptionnelle(s)</div><div class="exc-content"></div></div>') // ajout d'un bloc d'informations pour renseigner les valeurs d'exception
            if (legendeProp.exceptions) {
                legendeProp.exceptions.forEach((item) => {
                    // pour chaque exception, on ajoute le label et la valeur
                    const dataFilteredException = multipleFiltersData(data, { [options.data.geoCol]: item })[0]
                    if (dataFilteredException) {
                        document.querySelector(options.legendTarget + ' > .exceptions > .exc-content').insertAdjacentHTML('beforeend', dataFilteredException[legendeProp.exceptionsLabel] + ' : ' + Number(dataFilteredException[options.mesure]).toLocaleString() + '<br/>')
                    }
                })
            }
            let detectNegativeNumber = 0
            // on détecte si le jeu de données contient des valeurs négatives (pour différencier les cercles proportionnels positifs et négatifs)
            data.forEach((item) => {
                if (item[options.mesure] < 0) { detectNegativeNumber++ }
                else { detectNegativeNumber }
            })
            return function (feature) {
                const dataFilterOnFeature = multipleFiltersData(data, { [options.data.geoCol]: feature.get(options.data.geoColBasemap) })[0]
                let styleAffected
                let exc
                if (legendeProp.exceptions) {
                    exc = legendeProp.exceptions
                } else {
                    exc = ''
                }
                if (dataFilterOnFeature) {
                    if (options.type.methode === 'Quantitatif') {
                        if (detectNegativeNumber === 0) {
                            if (exc.includes(dataFilterOnFeature[options.data.geoCol])) { return styleAffected = styleCircle(legendeProp.exceptionsRadius * dataFilterOnFeature[options.mesure], legendeProp.colorFill, legendeProp.stroke + 0.5, legendeProp.colorStroke) }
                            else { return styleAffected = styleCircle(legendeProp.radius * dataFilterOnFeature[options.mesure], legendeProp.colorStroke, legendeProp.stroke, legendeProp.colorFill) }
                        }
                        else if (detectNegativeNumber > 0) {
                            if (!document.querySelector(options.legendTarget).querySelector('.indications')) {
                                document.querySelector(options.legendTarget).insertAdjacentHTML('beforeend', "<div class='indications mt-2'><div style='margin-top: 5px; margin-left: -10px;'><p style='font-size: 11px; background-color: #23468b; color: white; padding: 4px; border-radius: 4px; opacity: 0.4; display: inline-block;'>> 0</p><p style='font-size: 11px; background-color: #d41019; color: white; padding: 4px; border-radius: 4px; opacity: 0.4; display: inline-block; margin-left: 5px;'>< 0</p></div></div>")
                            }
                            if (dataFilterOnFeature[options.mesure] > 0) {
                                if (exc.includes(dataFilterOnFeature[options.data.geoCol])) { return styleAffected = styleCircle(legendeProp.exceptionsRadius * dataFilterOnFeature[options.mesure], "rgba(42, 84, 170, 0.7)", legendeProp.stroke + 0.5, legendeProp.colorStroke) }
                                else { return styleAffected = styleCircle(legendeProp.radius * dataFilterOnFeature[options.mesure], legendeProp.colorStroke, legendeProp.stroke, "rgba(42, 84, 170, 0.7)") }
                            }
                            else if (dataFilterOnFeature[options.mesure] < 0) {
                                if (exc.includes(dataFilterOnFeature[options.data.geoCol])) { return styleAffected = styleCircle(legendeProp.exceptionsRadius * Math.abs(dataFilterOnFeature[options.mesure]), "rgba(212, 16, 25, 0.7)", legendeProp.stroke + 0.5, legendeProp.colorStroke) }
                                else { return styleAffected = styleCircle(legendeProp.radius * Math.abs(dataFilterOnFeature[options.mesure]), legendeProp.colorStroke, legendeProp.stroke, "rgba(212, 16, 25, 0.7)") }
                            }
                        }
                    }
                    if (options.type.methode === 'Qualitatif') {
                        legendeProp.legende.forEach((item) => {
                            if (dataFilterOnFeature[options.mesure] === item.val[0]) {
                                return styleAffected = styleCircle(legendeProp.radius, item.color_stroke, item.stroke_width, item.color_fill)
                            }
                        })
                    }
                }
                else {
                    return null
                }
                return styleAffected
            }
        } else {
            console.log(options.type.mode + " : ce type de représentation n'est pas supporté")
            return
        }
    }

    /**
     * @desc Add map components
     *
     * @param {Array.<Object>} data - Data object
     * 
     * @returns {Function} Return components instantiated
     */
    addMapComponents(data) {
        const options = this.options
        if (options.dateCol) {
            // Add date to title if dateCol exists
            const str = options.dateCol
            const extractDateCol = str.match("{(.*)}")
            const strCleaned = str.replace(/{.+?}/g, data[0][extractDateCol[1]])
            const titleWithDate = options.title + ' ' + strCleaned
            options.title = titleWithDate
        }
        // Download data component
        if (options.downloadButtonTarget) {
            const el = document.querySelector(options.blocMapTarget).querySelector(options.downloadButtonTarget)
            el.outerHTML = el.outerHTML
            document.querySelector(options.blocMapTarget).querySelector(options.downloadButtonTarget).addEventListener('click', () => {
                saveFileXlsx(data)
            })
        }
        // Print map component
        if (options.printButtonTarget) {
            const el = document.querySelector(options.blocMapTarget).querySelector(options.printButtonTarget)
            el.outerHTML = el.outerHTML
            document.querySelector(options.blocMapTarget).querySelector(options.printButtonTarget).addEventListener('click', () => {
                printDomElement(options.blocMapTarget)
            })
        }
        // Share map component (URL sharing)
        const shareComponent = function (iconHtml) {
            const blocChartParam = window.location.href.search("idChart") === -1 ? '&idChart=' + options.blocMapTarget.substring(1, options.blocMapTarget.length) : ''
            if ((options.downloadButtonTarget) && document.querySelector(options.blocMapTarget).querySelector(options.downloadButtonTarget) && !(document.querySelector(options.blocMapTarget).querySelector('.share-control'))) {
                document.querySelector(options.blocMapTarget + " " + options.downloadButtonTarget).parentNode.insertAdjacentHTML('beforeend', '<a role="button" target="_blank" class="btn btn-light control-data share-control full-screen" title="Partager l\'URL" href="/share' + location.search + blocChartParam + '">' + iconHtml + '</a>')
            }
            else if (document.querySelector(options.blocMapTarget).querySelector('.tooltips') && !(document.querySelector(options.blocMapTarget).querySelector('.tooltips .share-control'))) {
                document.querySelector(options.blocMapTarget).querySelector('.tooltips').insertAdjacentHTML('beforeend', '<a role="button" target="_blank" class="btn btn-light control-data share-control full-screen" title="Partager l\'URL" href="/share' + location.search + blocChartParam + '">' + iconHtml + '</a>')
            }
            else if (document.querySelector(options.blocMapTarget).querySelector('.share-control') || document.querySelector(options.blocMapTarget).querySelector('.tooltips > .share-control')) {
                return
            }
            else {
                console.log('Le bouton de partage du graphique ' + options.title + ' ne peut s\'afficher, définissez options.downloadButtonTarget ou ajoutez un élément HTML ayant pour classe "tooltips"')
            }
        }
        fetch('/icons/share.svg')
            .then(resp => {
                shareComponent('<img class="icons-control-stat share-icon" src="' + resp.url + '" alt="Partager">')
            })
            .catch(() => {
                console.log('icons/share.svg n\'existe pas')
                shareComponent('<i class="fas fa-code icons-control-stat" style="color: #9f9f9f;"></i>')
            })
    }
}

/**
 * @desc Remplissage du sélecteur d'analyses cartographiques
 *
 * @param {Object} options - Options de l'analyse (voir optionsChecker) 
 * @param {Array} layers - Liste des couches déclarées (voir map-layer-loader:loader)
 * 
 * @returns {Function} Retourne la liste déroulante remplie des analyses cartographiques et applique par défaut la première disponible
 */
const setCartoAnalyzesSelector = function (options, layers) {
    if (globalAnalyzes.length) {
        globalAnalyzes.forEach((elm) => {
            document.querySelector(options.selectTarget).add(new Option(elm.options.title, elm.id))
        })
        document.querySelector(options.selectTarget).addEventListener('change', () => {
            const legendEl = document.querySelector(options.legendTarget)
            while (legendEl.firstChild) legendEl.removeChild(legendEl.firstChild)
            legendEl.insertAdjacentHTML('beforeend', "<div class='legend-classes'></div>")
            const styleSelected = globalAnalyzes.filter(e => String(e.id) === String(document.querySelector(options.selectTarget + " select").value))
            const layerToDisplay = []
            if (styleSelected.length) {
                layers.forEach(function (item) {
                    if (item.get('name') === styleSelected[0].options.data.layer) {
                        layerToDisplay.push(item)
                    }
                })
                if (layerToDisplay.length === 1) {
                    layers.forEach(function (l) {
                        l.setStyle(null)
                    })
                    // Specific part with dependance to layer name
                    // For "communes_geo_centroid" OL layer (see available layers in config/geoserver_config.json), we display the "communes_geo" layer
                    // "communes_geo_centroid" is a "point" layer, "communes_geo" add a polygon overlay for a better lisibility
                    if (layerToDisplay[0].get('name') === 'communes_geo_centroid') {
                        globalAnalyzes.forEach(function (o) {
                            if (o.options.title === "Contours") {
                                layers.forEach(function (l) {
                                    if (l.get('name') === 'communes_geo') {
                                        l.setStyle(o.apply())
                                    }
                                })
                            }
                        })
                    }
                    layerToDisplay[0].setStyle(styleSelected[0].apply())
                    createLegend(options.legendTarget + ' > .legend-classes', styleSelected[0])
                } else {
                    console.log("L'analyse " + styleSelected[0].lib + " existe déjà, vérifiez la présence d'un doublon")
                }
            } else {
                console.log("Aucune analyse cartographique n'a pu être initialisée")
            }
        })
    } else {
        console.log("Problème d'initialisations des analyses cartographiques")
        return
    }
}

export { globalAnalyzes, MapAnalysis, setCartoAnalyzesSelector, mapOptionsChecker }