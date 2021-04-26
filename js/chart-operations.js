'use strict';

import { Chart, registerables } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap'
import { SankeyController, Flow } from "chartjs-chart-sankey"
import { MatrixController, MatrixElement } from "chartjs-chart-matrix"
import { multipleFiltersData, isEmpty, isObject, groupBy, roundDec, objToQueryString, multipleGroupBySum } from './data-operations.js'
import { fullScreen, isHidden, hideChildrenFromEl } from './navigation.js'
import { printDomElement, saveFileXlsx } from './exports.js'
import { listeTerritoires } from './user-interaction.js'
import { chartOpts } from './chart-options.js'
import Tablesort from 'tablesort'

Chart.register(...registerables, TreemapController, TreemapElement, SankeyController, Flow, MatrixController, MatrixElement)

/**
 * @desc Vérifie la validité des options configurées pour générer un graphique
 *
 * @param {Object} options - Options du graphique à vérifier
 * @param {String} options.targetBlocChart - Elément du DOM pointant vers le bloc du graphique
 * @param {String} options.chart.target -  Elément du DOM pointant vers le graphique
 * @param {String} options.chart.downloadButtonTarget - Elément du DOM pointant vers le bouton (ou lien) de téléchargement des données
 * @param {String} options.chart.printButtonTarget - Elément du DOM pointant vers le bouton (ou lien) d'impression du graphique
 * @param {('keyNumber'|'table'|'bar'|'horizontalBar'|'line'|'pie'|'radar'|'polarArea'|'doughnut'|'bubble'|'treemap')} options.chart.type - Type de graphique
 * @param {?Object} options.chart.options - Objet de configuration des graphiques (voir chart-options.js)
 * @param {String} options.chart.name - Nom du graphique
 * @param {String} options.chart.title.target - Elément du DOM pointant sur le titre
 * @param {String} options.chart.title.text - Texte du titre
 * @param {?String} options.chart.title.dateCol - Formatage d'une valeur d'une colonne des données à ajouter à la suite du titre (ex. : 'en {numero_annee}' affichera directement la valeur de la colonne {numero_annee})
 * @param {?String} options.chart.icon.target - Elément du DOM pointant sur l'icône
 * @param {?String} options.chart.icon.val - Chemin relatif vers l'icône
 * @param {String} options.chart.source.target - Elément du DOM pointant sur la source
 * @param {String} options.chart.source.text - Texte de la source
 * @param {Boolean} options.chart.compare - True : active la comparaison territoriale
 * @param {Boolean} options.chart.filter.active - True : active l'option de filtrage (prend la forme d'une liste déroulante)
 * @param {?String} options.chart.filter.col - Champ sur lequel on active le filtre - bien penser à activer un filtre par défaut via options.data.customFilters
 * @param {?String} options.chart.filter.alias - Titre du filtre (alias de la colonne, par exemple si la colonne se nomme "sect_act", on peut afficher un alias "Secteur d'activités")
 * @param {Boolean} options.chart.customColor - True : active la colorisation personnalisée des catégories d'un graphique
 * @param {('chart-label'|'chart-datasets-label')} options.chart.customColor.type - Type de label : 'chart-label' ou 'chart-datasets-label' (voir orderColorsDataset)
 * @param {?Array.<Object>} options.chart.customColor.objColors - Objet contenant les catégories et couleurs à appliquer (voir orderColorsDataset)
 * @param {?String} options.chart.customColor.objColors[].categ - Catégorie sur laquelle on souhaite appliquer un style (voir orderColorsDataset)
 * @param {?String} options.chart.customColor.objColors[].backgroundColor - Couleur du fond (voir orderColorsDataset)
 * @param {?String} options.chart.customColor.objColors[].borderColor - Couleur du contour (voir orderColorsDataset)
 * @param {String} options.data.sourceUrl - URL du flux de données - doit retourner une liste d'objets {Array.<Object>}
 * @param {Object} options.data.params - Paramètres à appliquer au flux de données, pour réutiliser la valeur d'un paramètre de l'URL courante : {"monParam": "{monParam}", "monParam2": "{monParam2}"}
 * @param {Object} options.data.customFilters - Filtres à appliquer (voir multipleFiltersData)
 * @param {Number} options.data.index - Index du flux de données (de type {Array.<Object>}) à utiliser
 * @param {Array} options.data.label - Colonne.s référençant le.s label.s à afficher dans le graphique
 * @param {String} options.data.groupBy - Colonne de groupement (pas d'agrégat)
 * @param {Array} options.data.mesure - Colonne.s référençant le.s mesure.s du graphique
 * @param {String} options.data.unit - Unité de la valeur (s'applique sur toutes les mesures)
 * @param {Number} options.data.dec - Nombre de décimales (s'applique sur toutes les mesures)
 * @param {String} options.data.backgroundColor - Couleur de fond
 * @param {String} options.data.borderColor - Couleur du contour
 * @param {Number} options.data.width - Epaisseur du contour
 * 
 * @returns {Boolean} Retourne true si l'objet est valide
 */
const chartOptionsChecker = (options) => {
    const typesChartAvailable = ['keyNumber', 'table', 'bar', 'horizontalBar', 'line', 'pie', 'radar', 'polarArea', 'doughnut', 'bubble', 'treemap', 'sankey']
    const typesCustomColor = ['chart-label', 'chart-datasets-label']

    const getkeys = (obj, prefix) => {
        const keys = Object.keys(obj)
        prefix = prefix ? prefix + '.' : ''
        return keys.reduce(function (result, key) {
            if (isObject(obj[key]) && key !== 'options' && key !== 'objColors' && key !== 'customFilters' && key !== 'params') {
                result = result.concat(getkeys(obj[key], prefix + key))
            } else {
                result.push(prefix + key)
            }
            return result
        }, [])
    }

    const optionsKeysCorrectFormat = ["targetBlocChart", "chart.target", "chart.downloadButtonTarget", "chart.printButtonTarget", "chart.type", "chart.options", "chart.name", "chart.title.target", "chart.title.text", "chart.title.dateCol", "chart.icon.target", "chart.icon.val", "chart.source.target", "chart.source.text", "chart.compare", "chart.filter.active", "chart.filter.col", "chart.filter.alias", "chart.customColor.active", "chart.customColor.type", "chart.customColor.objColors", "data.sourceUrl", "data.params", "data.customFilters", "data.index", "data.label", "data.groupBy", "data.mesure", "data.unit", "data.dec", "data.backgroundColor", "data.borderColor", "data.width"]
    const optionsKeysToCheck = getkeys(options)

    if (JSON.stringify(optionsKeysCorrectFormat) === JSON.stringify(optionsKeysToCheck)) {
        // options.targetBlocChart doit être string et ne peut être null
        if (options.targetBlocChart) {
            if (typeof options.targetBlocChart !== 'string') {
                console.log('[' + options.chart.name + '] options.targetBlocChart doit être au format string')
                return
            }
            if (!document.querySelector(options.targetBlocChart)) {
                console.log('[' + options.chart.name + '] options.targetBlocChart n\'existe pas')
                return
            }
        }
        if (isEmpty(options.targetBlocChart)) {
            console.log('[' + options.chart.name + '] options.targetBlocChart ne peut être null')
            return
        }
        // options.chart.target doit être string et ne peut être null
        if (options.chart.target) {
            if (typeof options.chart.target !== 'string') {
                console.log('[' + options.chart.name + '] options.chart.target doit être au format string')
                return
            }
            if (!document.querySelector(options.targetBlocChart).querySelector(options.chart.target)) {
                console.log('[' + options.chart.name + '] options.chart.target n\'existe pas')
                return
            }
            const targetType = document.querySelector(options.targetBlocChart).querySelector(options.chart.target).tagName
            if (!(options.chart.type === 'table' || options.chart.type === 'keyNumber')) {
                if (targetType !== 'CANVAS') {
                    console.log('[' + options.chart.name + '] Pour tous les graphiques exceptés les "table" et "keyNumber", options.chart.target doit pointer vers un élément <canvas></canvas>')
                    return
                }
            }
            if (options.chart.type === 'table' || options.chart.type === 'keyNumber') {
                if (targetType !== 'DIV') {
                    console.log('[' + options.chart.name + '] Pour les "table" et "keyNumber", options.chart.target doit pointer vers un élément <div></div>')
                    return
                }
            }
        }
        if (isEmpty(options.chart.target)) {
            console.log('[' + options.chart.name + '] options.chart.target ne peut être null')
            return
        }
        // options.chart.downloadButtonTarget peut être string ou null
        if (options.chart.downloadButtonTarget) {
            if (typeof options.chart.downloadButtonTarget !== 'string') {
                console.log('[' + options.chart.name + '] options.chart.downloadButtonTarget doit être au format string')
                return
            }
            if (!document.querySelector(options.chart.downloadButtonTarget)) {
                console.log('[' + options.chart.name + '] options.chart.downloadButtonTarget n\'existe pas')
                return
            }
        }
        // options.chart.printButtonTarget peut être string ou null
        if (options.chart.printButtonTarget) {
            if (typeof options.chart.printButtonTarget !== 'string') {
                console.log('[' + options.chart.name + '] options.chart.printButtonTarget doit être au format string')
                return
            }
            if (!document.querySelector(options.chart.printButtonTarget)) {
                console.log('[' + options.chart.name + '] options.chart.printButtonTarget n\'existe pas')
                return
            }
        }
        // options.chart.type doit être string et ne peut être null
        if (options.chart.type) {
            if (typeof options.chart.type !== 'string') {
                console.log('[' + options.chart.name + '] options.chart.type doit être au format string')
                return
            }
            if (!typesChartAvailable.includes(options.chart.type)) {
                console.log('[' + options.chart.name + '] Le type de graphique ' + options.chart.type + ' n\'est pas supporté')
                return
            }
            if (['bubble', 'sankey'].includes(options.chart.type)) {
                if (options.data.mesure.length !== 3) {
                    console.log('[' + options.chart.name + '] Pour le type bubble ou sankey, vous devez renseigner 3 mesures dans options.data.mesure (origine X : options.data.mesure[0], destination Y : options.data.mesure[1], valeur : options.data.mesure[2])')
                    return
                }
            }
            if (['treemap', 'sankey'].includes(options.chart.type)) {
                if (!(options.chart.customColor.active) || isEmpty(options.chart.customColor.objColors)) {
                    console.log('[' + options.chart.name + '] Pour le type treemap ou sankey, utilisez un objet customColor pour personnaliser les couleurs des catégories')
                    return
                }
            }
            if (options.chart.type === 'treemap') {
                if (options.data.mesure.length > 1 || options.data.label.length > 1) {
                    console.log('[' + options.chart.name + '] Pour le type treemap, vous ne pouvez renseigner qu\'une mesure et un label')
                    return
                }
            }
            if (options.chart.type === "keyNumber") {
                if (options.data.mesure.length > 1 || options.data.label.length > 1) {
                    console.log('[' + options.chart.name + '] Pour le type keyNumber, vous ne pouvez renseigner qu\'une mesure et un label')
                    return
                }
            }
        }
        if (isEmpty(options.chart.type)) {
            console.log('[' + options.chart.name + '] options.chart.type ne peut être null')
            return
        }
        // options.chart.options peut être un string ou null
        if (options.chart.options) {
            if (typeof options.chart.options !== 'string') {
                console.log('[' + options.chart.name + '] options.chart.options doit être un string (le nom d\'un objet) ou null')
                return
            }
        }
        // options.chart.name doit être string et ne peut être null
        if (options.chart.name) {
            if (typeof options.chart.name !== 'string') {
                console.log('[' + options.chart.name + '] options.chart.name doit être au format string')
                return
            }
        }
        if (isEmpty(options.chart.name)) {
            console.log('[' + options.chart.name + '] options.chart.name ne peut être null')
            return
        }
        // options.chart.title.target peut être string ou null
        if (options.chart.title.target) {
            if (typeof options.chart.title.target !== 'string') {
                console.log('[' + options.chart.name + '] options.chart.title.target doit être au format string')
                return
            }
            if (!document.querySelector(options.chart.title.target)) {
                console.log('[' + options.chart.name + '] options.chart.title.target n\'existe pas')
                return
            }
        }
        // options.chart.title.text peut être string ou null
        if (options.chart.title.text) {
            if (typeof options.chart.title.text !== 'string') {
                console.log('[' + options.chart.name + '] options.chart.title.text doit être au format string ou null')
                return
            }
        }
        // options.chart.title.colDate peut être string ou null
        if (options.chart.title.dateCol) {
            if (typeof options.chart.title.dateCol !== 'string') {
                console.log('[' + options.chart.name + '] options.chart.title.dateCol doit être au format string ou null')
                return
            }
        }
        // options.chart.icon.target peut être string ou null
        if (options.chart.icon.target) {
            if (typeof options.chart.icon.target !== 'string') {
                console.log('[' + options.chart.name + '] options.chart.icon.target doit être au format string')
                return
            }
            if (!document.querySelector(options.chart.icon.target)) {
                console.log('[' + options.chart.name + '] options.chart.icon.target n\'existe pas')
                return
            }
        }
        // options.chart.icon.val peut être string ou null
        if (options.chart.icon.val) {
            if (typeof options.chart.icon.val !== 'string') {
                console.log('[' + options.chart.name + '] options.chart.icon.val doit être au format string ou null')
                return
            }
        }
        // options.chart.source.target peut être string ou null
        if (options.chart.source.target) {
            if (typeof options.chart.source.target !== 'string') {
                console.log('[' + options.chart.name + '] options.chart.source.target doit être au format string')
                return
            }
            if (!document.querySelector(options.chart.source.target)) {
                console.log('[' + options.chart.name + '] options.chart.source.target n\'existe pas')
                return
            }
        }
        // options.chart.source.text peut être string ou null
        if (options.chart.source.text) {
            if (typeof options.chart.source.text !== 'string') {
                console.log('[' + options.chart.name + '] options.chart.source.text doit être au format string ou null')
                return
            }
        }
        // options.chart.compare doit être un booléen et ne peut être null
        if (options.chart.compare) {
            if (typeof options.chart.compare !== 'boolean') {
                console.log('[' + options.chart.name + '] options.chart.compare doit être un booléen')
                return
            }
        }
        if (isEmpty(options.chart.compare)) {
            console.log('[' + options.chart.name + '] options.chart.compare ne peut être null')
            return
        }
        // options.chart.filter.active doit être un booléen et ne peut être null
        if (options.chart.filter.active) {
            if (typeof options.chart.filter.active !== 'boolean') {
                console.log('[' + options.chart.name + '] options.chart.filter.active doit être un booléen')
                return
            }
            if (isEmpty(options.chart.filter.col)) {
                console.log('[' + options.chart.name + '] options.chart.filter est active, la définition d\'une colonne de filtre est nécessaire')
                return
            }
            if (isEmpty(options.chart.filter.alias)) {
                console.log('[' + options.chart.name + '] options.chart.filter est active, la définition d\'un alias de la colonne de filtre est nécessaire')
                return
            }
        }
        if (isEmpty(options.chart.filter.active)) {
            console.log('[' + options.chart.name + '] options.chart.filter.active ne peut être null')
            return
        }
        // options.chart.filter.col doit être de type string ou null
        if (options.chart.filter.col) {
            if (typeof options.chart.filter.col !== 'string') {
                console.log('[' + options.chart.name + '] options.chart.filter.col doit être un string ou null')
                return
            }
        }
        // options.chart.filter.alias doit être de type string ou null
        if (options.chart.filter.alias) {
            if (typeof options.chart.filter.alias !== 'string') {
                console.log('[' + options.chart.name + '] options.chart.filter.alias doit être un string ou null')
                return
            }
        }
        // options.chart.customColor.active doit être un booléen et ne peut être null
        if (options.chart.customColor.active) {
            if (typeof options.chart.customColor.active !== 'boolean') {
                console.log('[' + options.chart.name + '] options.chart.customColor.active doit être un booléen')
                return
            }
        }
        if (isEmpty(options.chart.customColor.active)) {
            console.log('[' + options.chart.name + '] options.chart.customColor.active ne peut être null')
            return
        }
        // options.chart.customColor.type doit être un string ou null
        if (options.chart.customColor.type) {
            if (typeof options.chart.customColor.type !== 'string') {
                console.log('[' + options.chart.name + '] options.chart.customColor.type doit être un string')
                return
            }
            if (!typesCustomColor.includes(options.chart.customColor.type)) {
                console.log('[' + options.chart.name + '] options.chart.customColor.type est incorrect, les valeurs acceptées sont : "chart-label" ou "chart-datasets-label"')
                return
            }
        }
        // options.chart.customColor.objColor doit être un objet ou null
        if (options.chart.customColor.objColors) {
            if (typeof options.chart.customColor.objColors !== 'object') {
                console.log('[' + options.chart.name + '] options.chart.customColor.objColors doit être un objet ou null')
                return
            } else {
                const objColorsCorrect = ["0.categ", "0.backgroundColor", "0.borderColor"]
                const objColorsKeys = getkeys(options.chart.customColor.objColors)
                if (JSON.stringify(objColorsCorrect) !== JSON.stringify(objColorsKeys.slice(0, 3))) {
                    console.log('[' + options.chart.name + '] Le format de options.chart.customColor.objColors est incorrect, le format correct est [{ "categ": "val", "backgroundColor": "val", "borderColor": "val" }, {...}]')
                    return
                }
            }
        }
        // options.data.sourceUrl peut être string et ne peut être null
        if (options.data.sourceUrl) {
            if (typeof options.data.sourceUrl !== 'string') {
                console.log('[' + options.chart.name + '] options.data.sourceUrl doit être un string')
                return
            }
        }
        if (!options.data.sourceUrl) {
            console.log('[' + options.chart.name + '] options.data.sourceUrl ne peut être null')
            return
        }
        // options.data.params doit être un objet et ne peut être null
        if (options.data.params) {
            if (!isObject(options.data.params)) {
                console.log('[' + options.chart.name + '] options.data.params doit être un objet')
                return
            }
        }
        if (isEmpty(options.data.params)) {
            console.log('[' + options.chart.name + '] options.data.params ne peut être null, mais l\'objet peut être vide')
            return
        }
        // options.data.customFilters doit être un objet et ne peut être null
        if (options.data.customFilters) {
            if (!isObject(options.data.customFilters)) {
                console.log('[' + options.chart.name + '] options.data.customFilters doit être un objet')
                return
            }
        }
        if (isEmpty(options.data.customFilters)) {
            console.log('[' + options.chart.name + '] options.data.customFilters ne peut être null, mais l\'objet peut être vide')
            return
        }
        // options.data.index doit être un integer et ne peut être null
        if (options.data.index) {
            if (!Number.isInteger(options.data.index)) {
                console.log('[' + options.chart.name + '] options.data.index doit être de type integer')
                return
            }
        }
        if (isEmpty(options.data.index)) {
            console.log('[' + options.chart.name + '] options.data.index ne peut être null')
            return
        }
        // options.data.label doit être de type array et ne peut être null
        if (options.data.label) {
            if (!Array.isArray(options.data.label)) {
                console.log('[' + options.chart.name + '] options.data.label doit être de type array')
                return
            }
        }
        if (isEmpty(options.data.label)) {
            console.log('[' + options.chart.name + '] options.data.label ne peut être null')
            return
        }
        // options.data.groupBy doit être de type string et ne peut être null
        if (options.data.groupBy) {
            if (!(Array.isArray(options.data.groupBy) || typeof options.data.groupBy === 'string')) {
                console.log('[' + options.chart.name + '] options.data.groupBy doit être de type array ou string')
                return
            }
        }
        if (isEmpty(options.data.groupBy)) {
            console.log('[' + options.chart.name + '] options.data.groupBy ne peut être null')
            return
        }
        // options.data.mesure doit être de type array et ne peut être null
        if (options.data.mesure) {
            if (!Array.isArray(options.data.mesure)) {
                console.log('[' + options.chart.name + '] options.data.mesure doit être de type array')
                return
            }
        }
        if (isEmpty(options.data.mesure)) {
            console.log('[' + options.chart.name + '] options.data.mesure ne peut être null')
            return
        }
        // options.data.unit peut être un string ou null
        if (options.data.unit) {
            if (typeof options.data.unit !== 'string') {
                console.log('[' + options.chart.name + '] options.data.unit doit être au format string ou null')
                return
            }
        }
        // options.data.dec doit être un integer et ne peut être null
        if (options.data.dec) {
            if (!Number.isInteger(options.data.dec)) {
                console.log('[' + options.chart.name + '] options.data.dec doit être de type integer')
                return
            }
        }
        if (isEmpty(options.data.dec)) {
            console.log('[' + options.chart.name + '] options.data.dec ne peut être null')
            return
        }
        // options.data.backgroundColor doit être de type array ou null
        if (options.data.backgroundColor) {
            if (!Array.isArray(options.data.backgroundColor)) {
                console.log('[' + options.chart.name + '] options.data.backgroundColor doit être de type array')
                return
            }
        }
        // options.data.borderColor doit être de type array ou null
        if (options.data.borderColor) {
            if (!Array.isArray(options.data.borderColor)) {
                console.log('[' + options.chart.name + '] options.data.borderColor doit être de type array')
                return
            }
        }
        // options.data.width doit être un integer et ne peut être null
        if (options.data.width) {
            if (!Number.isInteger(options.data.width)) {
                console.log('[' + options.chart.name + '] options.data.width doit être de type integer')
                return
            }
        }
        if (isEmpty(options.data.width)) {
            console.log('[' + options.chart.name + '] options.data.width ne peut être null')
            return
        }
        return true
    } else {
        console.log('[' + ((options.chart.name) ? (options.chart.name) : 'options.chart.name n\'est pas renseigné') + '] Le format des options du graphique est incorrect, une ou plusieurs options sont manquantes')
        return false
    }
}

/** @global Liste des graphiques instanciés */
const globalCharts = []

/** 
 * Classe représentant un graphique
 */
class ChartVisualization {
    /**
     * @desc Créer une analyse cartographique
     * 
     * @param {Object} options - Options du graphique (voir optionsChecker) 
     */
    constructor(options) {
        this.chart
        this.datasetStructure
        this.options = options
        globalCharts.push(this)
    }

    getCharts() {
        return globalCharts
    }

    /**
     * @desc Initialise un graphique (dépend de Chart.js)
     *
     * @returns {Object} Retourne le graphique instancié
     */
    initChart() {
        const options = this.options
        const ctx = document.querySelector(options.targetBlocChart).querySelector(options.chart.target).getContext('2d')
        const chartOptions = chartOpts(options)
        // Fix for Chart.js > 3.* ('horizontalBar' type isn't supported anymore, it's replaced by chart.type = 'bar' + chart.data.datasets[i].indexAxis = 'y' + chart.options.indexAxis = 'y')
        // Search indexAxis in this file to see the changes
        if (options.chart.type === 'horizontalBar') {
            chartOptions[options.chart.options]['indexAxis'] = 'y'
        }
        let pluginChart
        if (!['treemap', 'bubble'].includes(options.chart.type)) {
            pluginChart = [ChartDataLabels]
        }
        this.chart = new Chart(ctx, {
            type: typeCheck(options.chart.type),
            data: {
                datasets: [{
                }]
            },
            plugins: pluginChart,
            options: chartOptions[options.chart.options]
        })
        return this.chart
    }

    /**
     * @desc Prépare les données avant la création du graphique
     * 
     * @param {Object} data - Les données à vérifier
     *
     * @returns {Object} Retourne les données nettoyées
     */
    dataSourceOperations(data) {
        let dataObj // Array of objects
        const options = this.options
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
        if (dataObj) {
            // If options.data.customFilters isn't empty, apply filters and reassign the result to dataObj
            if (Object.keys(options.data.customFilters).length > 0) {
                dataObj = multipleFiltersData(dataObj, options.data.customFilters)
            }
            else if (options.chart.filter.active === true) {
                if (document.querySelector(options.targetBlocChart + ' .select-filter select')) {
                    dataObj = multipleFiltersData(dataObj, { [options.chart.filter.col]: String(document.querySelector(options.targetBlocChart + ' .select-filter select').value) })
                }
            }
            else {
                dataObj
            }
        }
        if (isEmpty(dataObj) || dataObj == undefined) {
            // If dataObj is empty, remove the analysis according to the data from globalAnalyzes
            hideChildrenFromEl(document.querySelector(options.targetBlocChart))
            document.querySelector(options.targetBlocChart).childNodes[0].insertAdjacentHTML('beforeend', '<div class="alert alert-dark no-data mt-3" role="alert">Données non disponibles<div class="text-muted mt-2"><i class="far fa-frown mr-2"></i>' + options.chart.title.text + '</div></div>')
            return
        } else {
            if (document.querySelector(options.targetBlocChart).querySelector('.no-data')) {
                document.querySelector(options.targetBlocChart).querySelector('.no-data').style.display = "none"
            }
            return dataObj
        }
    }

    /**
     * @desc Formate le(s) dataset(s) et les options du graphique à partir de data 
     *
     * @param {Object} data - Données préparées
     * 
     * @returns {Object} Retourne le graphique avec le(s) dataset(s)
     */
    buildChartDatasets(data) {
        const options = this.options
        const chart = this.chart
        let datasetsToPopulate = {}
        const getColor = function (categ) {
            const result = {}
            const obj = options.chart.customColor.objColors
            obj.forEach(obj => result[obj.categ] = obj.backgroundColor)
            return result[categ]
        }

        const dataGroupBySum = multipleGroupBySum(data, options.data.groupBy, options.data.mesure)
        const dataGroupBy = groupBy(dataGroupBySum, (typeof options.data.groupBy === 'string') ? options.data.groupBy : options.data.groupBy[0])
        const labelData = Object.keys(dataGroupBy)
        if (!['bubble', 'treemap', 'sankey'].includes(options.chart.type)) {
            if (Array.isArray(options.data.mesure) && Array.isArray(options.data.label)) {
                options.data.mesure.forEach((mesure, m) => {
                    const datasetCateg = [], datasetVal = []
                    for (const [i, item] of Object.entries(dataGroupBy)) {
                        item.forEach((val, index) => {
                            datasetCateg[index] = datasetCateg[index] || []
                            datasetVal[index] = datasetVal[index] || []
                            if (val[options.data.label[m]] === undefined) {
                                datasetCateg[index].push(options.data.label[m])
                            }
                            else {
                                (!datasetCateg[index].includes(val[options.data.label[m]])) ? datasetCateg[index].push(val[options.data.label[m]]) : null
                            }
                            datasetVal[index].push(roundDec(val[mesure], options.data.dec))
                            datasetsToPopulate[index > 0 ? index : m] = {
                                type: typeCheck(options.chart.type),
                                label: datasetCateg[index][0],
                                data: datasetVal[index],
                                borderWidth: 0
                            }
                        })
                    }
                })
            } else {
                console.log(options.chart.name + ' : problème de paramétrage du graphique, vérifiez les options mesure et label')
            }
        }
        else if (options.chart.type === 'bubble' && options.data.mesure.length === 3) {
            if (typeof Object.entries(dataGroupBy)[0][options.data.mesure[0]] === 'number' && Object.entries(dataGroupBy)[0][options.data.mesure[1]] === 'number') {
                for (const [i, item] of Object.entries(dataGroupBy)) {
                    item.forEach((val, index) => {
                        const datasetCateg = [], datasetVal = []
                        datasetCateg[index] = datasetCateg[index] || []
                        datasetVal[index] = datasetVal[index] || []
                        if (val[options.data.label[0]] === undefined) {
                            datasetCateg[index].push(options.data.label[0])
                        }
                        else {
                            (!datasetCateg[index].includes(val[options.data.label[i]])) ? datasetCateg[index].push(val[options.data.label[i]]) : null
                        }
                        if (val[options.data.mesure[2]] > 10) {
                            const rLength = val[options.data.mesure[2]].toString().length
                            val[options.data.mesure[2]] = val[options.data.mesure[2]] / Math.pow(10, rLength - 2)
                        }
                        datasetVal[index].push({ 'x': roundDec(val[options.data.mesure[0]], options.data.dec), 'y': roundDec(val[options.data.mesure[1]], options.data.dec), 'r': roundDec(val[options.data.mesure[2]], options.data.dec) })
                        datasetsToPopulate[i] = {
                            type: options.chart.type,
                            label: i,
                            data: datasetVal[index],
                            borderWidth: 0,
                        }
                    })
                }
            } else {
                console.log('Pour le type bubble, les mesures doivent contenir des valeurs de type nombre (X : options.data.mesure[0] - number, Y : options.data.mesure[1] - number, V : options.data.mesure[2] - number)')
                return
            }
        }
        else if (options.chart.type === 'sankey' && options.data.mesure.length === 3) {
            if (Object.keys(dataGroupBy).length === 1) {
                let dataSankey = []
                dataGroupBy[Object.keys(dataGroupBy)].forEach(obj => {
                    if (obj[options.data.mesure[0]] === obj[options.data.mesure[1]]) {
                        console.log("L'origine (options.data.mesure[0]) ne peut être égale à la destination (options.data.mesure[1]), le jeu de données ne permet pas d'utiliser cette représentation")
                        return
                    }
                    if (!(typeof obj[options.data.mesure[0]] === 'string' && typeof obj[options.data.mesure[1]] === 'string')) {
                        console.log("L'origine (options.data.mesure[0]) et la destination (options.data.mesure[1]) doivent contenir des valeurs de type texte")
                        return
                    }
                    dataSankey.push({ 'from': obj[options.data.mesure[0]], 'to': obj[options.data.mesure[1]], 'flow': obj[options.data.mesure[2]] })
                })
                const datasetFinal = {
                    data: dataSankey,
                    colorFrom: function (ctx) {
                        if (ctx.dataset.data.length) {
                            if (ctx.dataset.data[ctx.dataIndex]) {
                                return getColor(ctx.dataset.data[ctx.dataIndex].from)
                            }
                        }
                    },
                    colorTor: function (ctx) {
                        if (ctx.dataset.data.length) {
                            if (ctx.dataset.data[ctx.dataIndex]) {
                                return getColor(ctx.dataset.data[ctx.dataIndex].to)
                            }
                        }
                    },
                    borderWidth: 0
                }
                chart.data.datasets = [datasetFinal]
                chart.options.plugins.datalabels = false
                chart.options.plugins.legend.display = false
                chart.type = 'sankey'
                chart.update()
            } else {
                console.log("Pour un diagramme de Sankey, groupBy ne doit retourner qu'un groupe d'éléments (et pas plusieurs groupes de plusieurs éléments), filtrez un groupe via options.data.customFilters")
                return
            }
        }
        else if (options.chart.type === 'treemap' && options.chart.customColor.active === true) {
            datasetsToPopulate = {
                tree: dataGroupBySum,
                key: options.data.mesure[0],
                groups: (typeof options.data.groupBy === 'string') ? [options.data.groupBy] : options.data.groupBy,
                spacing: -0.5,
                borderWidth: 1,
                fontColor: "#666",
                borderColor: "white",
                backgroundColor: function (ctx) {
                    if (ctx.dataset.data.length) {
                        if (ctx.dataset.data[ctx.dataIndex]) {
                            return getColor(ctx.dataset.data[ctx.dataIndex].g)
                        }
                    }
                }
            }
            chart.data.datasets.push(datasetsToPopulate)
            chart.options.plugins.tooltip = {
                callbacks: {
                    title: function (context) {
                        return context[0].raw.g
                    },
                    label: function (context) {
                        const dataset = context.dataset
                        const total = dataset.data.reduce((a, b) => a + b.v, 0)
                        const currentValue = dataset.data[context.dataIndex].v
                        const percentage = roundDec((currentValue / total * 100), 1).toLocaleString()
                        return Number(currentValue).toLocaleString() + ' (' + percentage + ' %)'
                    }
                }
            }
            chart.options.plugins.datalabels = false
            chart.options.plugins.legend.display = false
            chart.update()
        }
        if (!['treemap', 'sankey'].includes(options.chart.type)) {
            const dataFinal = { labels: labelData, datasets: [] }
            for (const [i] of Object.entries(datasetsToPopulate)) {
                dataFinal.datasets.push(datasetsToPopulate[i])
            }
            if (chart.data.labels.length > 0) {
                if (chart.data.labels.length > 1 && datasetsToPopulate[0].data.length === chart.data.labels.length) {
                    this.datasetStructure = 'addDataset'
                    for (const [i] of Object.entries(datasetsToPopulate)) {
                        chart.data.datasets.push(datasetsToPopulate[i])
                    }
                } else {
                    // si l'élément chart contient déjà des labels (et donc déjà un ou plusieurs datasets), on ajoute seulement le(s) dataset(s)
                    this.datasetStructure = 'addData'
                    chart.data.labels.push(labelData)
                    for (const [i, item] of Object.entries(datasetsToPopulate)) {
                        chart.data.datasets[i].data.push(...item.data)
                    }
                }
            } else {
                // sinon on affecte l'ensemble de l'objet dataFinal
                chart.data = dataFinal
            }
            // Fix for Chart.js > 3.* ('horizontalBar' type isn't supported anymore, it's replaced by 'bar' type + datasets indexAxis property)
            if (options.chart.type === 'horizontalBar') {
                chart.data.datasets.forEach(d => {
                    d.indexAxis = 'y'
                })
            }
            chart.data.datasets.forEach((item, i) => {
                chart.data.datasets[i].borderWidth = options.data.width
                if (!options.chart.customColor.active) {
                    if (chart.data.datasets.length > 1) {
                        if (options.data.backgroundColor.length === 0) {
                            chart.data.datasets[i].backgroundColor = "rgba(255, 255, 255, 0)"
                        }
                        else {
                            chart.data.datasets[i].backgroundColor = options.data.backgroundColor[i]

                        }
                        chart.data.datasets[i].borderColor = options.data.borderColor[i]
                    }
                    else {
                        // s'il n'y a qu'un seul dataset
                        if (options.data.backgroundColor.length === 0) {
                            // si arrayBackgroundColors est vide on affecte une valeur transparente
                            chart.data.datasets[i].backgroundColor = "rgba(255, 255, 255, 0)"
                            chart.data.datasets[i].borderColor = options.data.borderColor
                        }
                        else if (options.data.backgroundColor.length === 1) {
                            if (chart.config.type === 'bar' || chart.config.type === 'horizontalBar') {
                                // si arrayBackgroundColors contient une couleur, on l'affecte autant de fois qu'il y a de labels dans le dataset
                                const nbLabels = chart.data.labels.length
                                const repeatArrayBackgroundColors = Array.apply(null, Array(nbLabels)).map(function () { return options.data.backgroundColor[0] })
                                chart.data.datasets[i].backgroundColor = repeatArrayBackgroundColors
                                const repeatArrayBorderColors = Array.apply(null, Array(nbLabels)).map(function () { return options.data.borderColor[0] })
                                chart.data.datasets[i].borderColor = repeatArrayBorderColors
                            }
                            else {
                                chart.data.datasets[i].backgroundColor = options.data.backgroundColor
                                chart.data.datasets[i].borderColor = options.data.borderColor
                            }
                        }
                        else {
                            // sinon on affecte les listes
                            chart.data.datasets[i].backgroundColor = options.data.backgroundColor
                            chart.data.datasets[i].borderColor = options.data.borderColor
                        }
                    }
                } else {
                    //orderColorsDataset(options.chart.customColor.type, chart, options.chart.customColor.objColors)
                    this.orderColorsDataset()
                }
            })
        }
        chart.update()
    }

    /**
     * @desc Applique un style au graphique à partir d'un objet contenant des couleurs en fonction des catégories
     * 
     * @returns {Object} Retourne le graphique à jour avec le style personnalisé
     */
    orderColorsDataset() {
        if (this.options.chart.type !== 'treemap') {
            const labelType = this.options.chart.customColor.type
            const objColors = this.options.chart.customColor.objColors
            const chart = this.chart
            let itemsArrayIndex = [] // liste définissant l'ordre qu'on souhaite
            if (labelType === 'chart-label') {
                // si les valeurs ordonnées sont au niveau des labels (pas dans les datasets)
                itemsArrayIndex = chart.data.labels
            }
            if (labelType === 'chart-datasets-label') {
                // si les valeurs ordonnées sont au niveau des labels de chaque dataset
                chart.data.datasets.forEach((item, i) => {
                    itemsArrayIndex.push(chart.data.datasets[i].label)
                })
            }
            const result = [] // liste d'objets accueillant les résultats
            objColors.forEach((a) => {
                // on tri la liste d'objets objColors en fonction de l'ordre des éléments de la liste itemsArrayIndex, la liste d'objets trié est dans result
                result[itemsArrayIndex.indexOf(a.categ)] = a
            })
            const arraySortedBackgroundColor = [] // liste des couleurs issue de la liste d'objet triée précédemment (result)
            result.forEach((item, i) => {
                arraySortedBackgroundColor.push(result[i].backgroundColor)
            })

            const arraySortedBorderColor = []
            result.forEach((item, i) => {
                arraySortedBorderColor.push(result[i].borderColor)
            })

            chart.data.datasets.forEach((item, i) => {
                if (chart.data.datasets.length > 1) {
                    chart.data.datasets[i].backgroundColor = arraySortedBackgroundColor[i]
                    chart.data.datasets[i].borderColor = arraySortedBorderColor[i]
                }
                else {
                    chart.data.datasets[i].backgroundColor = arraySortedBackgroundColor
                    chart.data.datasets[i].borderColor = arraySortedBorderColor
                }
            })
            return chart.update()
        }
    }

    /**
     * @desc Supprime le(s) dataset(s) d'un graphique (voir la documentation de Chart.js pour la différence entre dataset et data)
     *
     * @returns {Function} Retourne le graphique à jour avec le(s) dataset(s) en moins
     */
    removeDatasets() {
        const chart = this.chart
        if (chart.data.datasets.length > 1) {
            chart.data.datasets.splice(-1, 1)
            chart.update()
        }
    }

    /**
     * @desc Supprime le(s) data(s) d'un graphique (voir la documentation de Chart.js pour la différence entre dataset et data)
     * 
     * @returns {Function} Retourne le graphique à jour avec le.s data.s en moins
     */
    removeData() {
        const chart = this.chart
        chart.data.datasets.length
        chart.data.labels.pop()
        chart.data.datasets.forEach((dataset) => {
            dataset.data.pop()
        })
        chart.update()
    }

    /**
     * @desc Active la fonctionnalité de filtrage d'un graphique sur un champ du jeu de données
     *
     * @returns {Function} Retourne la fonctionnaité de filtrage d'un graphique, prend la forme d'une liste déroulante attaché à un élément '.chart-filter' ou '.filter-chart' du graphique
     */
    filterChartData() {
        if ('undefined' !== typeof window.jQuery) {
            const chart = this.chart
            const options = this.options
            if (!document.querySelector(options.targetBlocChart).querySelector('.chart-filter')) {
                document.querySelector(options.targetBlocChart).querySelector('.footer-chart').insertAdjacentHTML('beforeend', '<div class="chart-filter mb-4"><div class="alias">' + options.chart.filter.alias + '</div><select class="form-control select-filter mt-3" data-live-search="true"><option value="">' + options.chart.filter.alias + '</option></select></div>')
            }
            let uniqueVal = []
            const colName = String(options.chart.filter.col)
            const filterSelectEl = document.querySelector(options.targetBlocChart + ' .select-filter')

            return fetch(`${options.data.sourceUrl}?${objToQueryString(options.data.params)}`)
                .then(response => response.json())
                .then(data => {
                    const dataChecked = this.dataSourceOperations(data)
                    if (dataChecked) {
                        uniqueVal = dataChecked
                            .map(p => p[colName])
                            .filter((col, index, arr) => arr.indexOf(col) === index)
                            .sort((a, b) => b - a)

                        $(options.targetBlocChart + ' .select-filter').selectpicker('destroy')
                        while (filterSelectEl.firstChild) filterSelectEl.removeChild(filterSelectEl.firstChild)
                        uniqueVal.forEach((item) => {
                            filterSelectEl.insertAdjacentHTML('beforeend', '<option value="' + item + '">' + item + '</option>')
                        })
                        $(options.targetBlocChart + ' .select-filter').selectpicker({
                            maxOptions: 10
                        })
                        document.querySelector(options.targetBlocChart + ' .select-filter select').addEventListener('change', () => {
                            chart.data.labels.length = 0
                            chart.data.datasets.length = 0
                            const currentFilters = options.data.customFilters // filtres actifs au démarrage
                            for (const [key] of Object.entries(options.data.customFilters)) {
                                // si une des colonnes de filtre est égale à la colonne de filtre de filterChartData, on l'enlève
                                if (key === colName) {
                                    delete currentFilters[key]
                                }
                            }
                            const filteredData = multipleFiltersData(dataChecked, { [colName]: String(document.querySelector(options.targetBlocChart + ' .select-filter select').value), ...currentFilters })
                            return this.buildChartDatasets(filteredData)
                        })
                    }
                })
                .catch(e => console.log(e))
        } else {
            console.log("jQuery est requis pour la fonctionnalité de filtre d'un graphique")
            return
        }
    }

    /**
     * @desc Active la fonctionnalité de comparaison territoriale d'un graphique
     *
     * @returns {Function} Retourne la fonctionnaité de comparaison territoriale d'un graphique
     */
    compareChart() {
        const chart = this.chart
        const options = this.options
        const target = this.options.targetBlocChart
        const chartConfig = this.options.chart
        const dataConfig = this.options.data
        const urlAppConfig = '/api/appConfig'
        const urlApiTerritoires = '/api/territoires'

        document.querySelector(target).querySelector('.footer-chart').insertAdjacentHTML('beforeend', '<button class="classic-button collapsed rect" type="button" data-toggle="collapse" data-target="#compare-' + chartConfig.name + '" aria-expanded="false" aria-controls="compare-' + chartConfig.name + '"><i class="fas fa-search mr-2"></i>Comparer</button>')
        document.querySelector(target).querySelector('.footer-chart').insertAdjacentHTML('beforeend', '<div class="collapse form mt-3" id="compare-' + chartConfig.name + '"><div class="alert alert-danger compare-max mb-3" role="alert" style="display: none; margin-bottom: auto;"></div><div class="form-territoire no-alert"></div></div>')
        listeTerritoires(target + ' .form-territoire', urlAppConfig, urlApiTerritoires)
        document.querySelector(target + ' #compare-' + chartConfig.name).insertAdjacentHTML('beforeend', '<button class="classic-button rect add mt-3 mr-2" type="submit"><i class="fas fa-plus mr-2"></i>Ajouter</button><button class="classic-button rect remove mt-3" type="submit"><i class="fas fa-minus mr-2"></i>Supprimer</button>')

        const urlParams = dataConfig.params

        document.querySelector(target + ' .add').addEventListener('click', () => {
            const objParameters = Object.keys(urlParams).reduce((o, key) => Object.assign(o, { [key]: (($(target + " [name='" + key + "']").val() !== undefined) ? ($(target + " [name='" + key + "']").val()) : urlParams[key]) }), {})
            fetch(`${dataConfig.sourceUrl}?${objToQueryString(objParameters)}`)
                .then(response => response.json())
                .then(data => {
                    const dataChecked = this.dataSourceOperations(data)
                    if (dataChecked) {
                        if (chart.data.datasets.length <= 6) {
                            if (options.chart.filter.active === true) {
                                if (!document.querySelector(options.targetBlocChart + ' .select-filter select').value) {
                                    this.buildChartDatasets(dataChecked)
                                } else {
                                    const colName = String(options.chart.filter.col)
                                    const filteredData = multipleFiltersData(dataChecked, { [colName]: [document.querySelector(options.targetBlocChart + ' .select-filter select').value] })
                                    this.buildChartDatasets(filteredData)
                                }
                            } else {
                                this.buildChartDatasets(dataChecked)
                            }
                        } else {
                            const alertEl = document.querySelector(target + ' .compare-max')
                            alertEl.style.display = 'block'
                            while (alertEl.firstChild) alertEl.removeChild(alertEl.firstChild)
                            alertEl.insertAdjacentHTML('beforeend', 'Maximum 3 comparaisons')
                        }
                    }
                })
                .catch(e => console.log(e))
        })

        document.querySelector(target + ' .remove').addEventListener('click', () => {
            if (chart.data.labels.length > 0) {
                if (this.datasetStructure === 'addDataset') {
                    this.removeDatasets()
                } else if (this.datasetStructure === 'addData') {
                    this.removeData()
                }
            }
            document.querySelector(target + ' .compare-max').style.display = 'none'
        })

    }

    /**
     * @desc Add chart components
     *
     * @param {Object} data - Data object
     * 
     * @returns {Function} Return components instantiated
     */
    addChartComponents(data) {
        const chart = this.chart
        const options = this.options

        if (isHidden(document.querySelector(options.targetBlocChart).querySelector(options.chart.target).parentElement)) {
            document.querySelector(options.targetBlocChart).querySelector(options.chart.target).parentElement.style.display = "block"
        } else {
            document.querySelector(options.targetBlocChart).querySelector(options.chart.target).style.display = "block"
        }
        if (options.chart.printButtonTarget) {
            if (isHidden(document.querySelector(options.targetBlocChart).querySelector(options.chart.printButtonTarget))) {
                document.querySelector(options.targetBlocChart).querySelector(options.chart.printButtonTarget).style.display = "block"
            }
        }
        if (options.chart.downloadButtonTarget) {
            if (isHidden(document.querySelector(options.targetBlocChart).querySelector(options.chart.downloadButtonTarget))) {
                document.querySelector(options.targetBlocChart).querySelector(options.chart.downloadButtonTarget).style.display = "block"
            }
        }
        if (options.chart.source.target) {
            if (isHidden(document.querySelector(options.targetBlocChart).querySelector(options.chart.source.target))) {
                document.querySelector(options.targetBlocChart).querySelector(options.chart.source.target).style.display = "block"
            }
        }
        if (document.querySelector(options.targetBlocChart).querySelector('.no-data')) {
            document.querySelector(options.targetBlocChart).querySelector('.no-data').remove()
        }
        if (options.chart.icon.val) {
            fetch(options.chart.icon.val)
                .then(() => {
                    const el = document.querySelector(options.targetBlocChart).querySelector(options.chart.icon.target)
                    while (el.firstChild) el.removeChild(el.firstChild)
                    el.insertAdjacentHTML('beforeend', '<img class="icon-cc" src="' + options.chart.icon.val + '"></img>')
                })
                .catch(() => {
                    console.log("options.chart.icon.val est incorrect")
                    return
                })
        }
        if (options.chart.downloadButtonTarget) {
            const el = document.querySelector(options.targetBlocChart).querySelector(options.chart.downloadButtonTarget)
            el.outerHTML = el.outerHTML
            document.querySelector(options.targetBlocChart).querySelector(options.chart.downloadButtonTarget).addEventListener('click', () => {
                saveFileXlsx(data)
            })
            if (document.querySelector(options.targetBlocChart).querySelector('.full-screen')) {
                document.querySelector(options.targetBlocChart).querySelector('.full-screen').remove()
            }
            fetch('/icons/full-size.svg')
                .then(resp => {
                    document.querySelector(options.targetBlocChart).querySelector(options.chart.downloadButtonTarget).parentElement.insertAdjacentHTML('beforeend', '<button class="btn btn-light control-data full-screen" title="Agrandir"><img class="icons-control-stat print-icon" src="' + resp.url + '" alt="Plein écran"></button>')
                    fullScreen('.full-screen', options.targetBlocChart)
                })
                .catch(() => {
                    document.querySelector(options.targetBlocChart).querySelector(options.chart.downloadButtonTarget).parentElement.insertAdjacentHTML('beforeend', '<button class="btn btn-light control-data full-screen" title="Agrandir"><i class="fas fa-arrows-alt icons-control-stat" style="color: #9f9f9f;"></i></button>')
                    fullScreen('.full-screen', options.targetBlocChart)
                })
        }
        if (options.chart.printButtonTarget) {
            const el = document.querySelector(options.targetBlocChart).querySelector(options.chart.printButtonTarget)
            el.outerHTML = el.outerHTML
            document.querySelector(options.targetBlocChart).querySelector(options.chart.printButtonTarget).addEventListener('click', () => {
                if (options.hasOwnProperty('printTemplate')) {
                    printDomElement(options.targetBlocChart, options.printTemplate)
                } else {
                    printDomElement(options.targetBlocChart)
                }
            })
        }
        if (options.chart.title.target) {
            const el = document.querySelector(options.targetBlocChart).querySelector(options.chart.title.target)
            while (el.firstChild) el.removeChild(el.firstChild)
            el.insertAdjacentHTML('beforeend', options.chart.title.text)
            if (options.chart.title.dateCol) {
                let str = options.chart.title.dateCol
                const extractDateCol = str.match("{(.*)}")
                if (extractDateCol) {
                    str = str.replace(/{.+?}/g, data[0][extractDateCol[1]])
                }
                el.insertAdjacentHTML('beforeend', " " + str)
            }
        }
        if (options.chart.source.target) {
            const el = document.querySelector(options.targetBlocChart).querySelector(options.chart.source.target)
            while (el.firstChild) el.removeChild(el.firstChild)
            el.insertAdjacentHTML('beforeend', options.chart.source.text)
        }
        if (options.chart.filter.active === true) {
            this.filterChartData()
        }
        if (options.chart.compare === true) {
            this.compareChart()
        }
        if (options.chart.customColor.active === true) {
            this.orderColorsDataset()
            chart.update()
        }
        const shareComponent = function (iconHtml) {
            const blocChartParam = window.location.href.search("idChart") ? '&idChart=' + options.targetBlocChart.substring(1, options.targetBlocChart.length) : ''
            if (document.querySelector(options.targetBlocChart).querySelector('.share')) {
                document.querySelector(options.targetBlocChart).querySelector('.share').remove()
            }
            if ((options.chart.downloadButtonTarget)) {
                if (document.querySelector(options.targetBlocChart).querySelector(options.chart.downloadButtonTarget)) {
                    document.querySelector(options.targetBlocChart + " " + options.chart.downloadButtonTarget).parentElement.insertAdjacentHTML('beforeend', '<a role="button" target="_blank" class="btn btn-light control-data share" title="Partager l\'URL" href="/share?' + objToQueryString(options.data.params) + blocChartParam + '">' + iconHtml + '</a>')
                }
            }
            else if (document.querySelector(options.targetBlocChart).querySelector('.tooltips')) {
                document.querySelector(options.targetBlocChart).querySelector('.tooltips').insertAdjacentHTML('beforeend', '<a role="button" target="_blank" class="btn btn-light control-data share" title="Partager l\'URL" href="/share?' + objToQueryString(options.data.params) + blocChartParam + '">' + iconHtml + '</a>')
            }
            else {
                console.log('Le bouton de partage du graphique ' + options.chart.name + ' ne peut s\'afficher, définissez options.chart.downloadButtonTarget ou ajoutez un élément HTML ayant pour classe "tooltips"')
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

    /**
     * @desc Construit le graphique
     *
     * @param {Object} dataObj - Data object
     * 
     * @returns {Function} Return chart
     */
    buildChart(dataObj) {
        const options = this.options
        if (options.chart.type === 'table') {
            const dataGroupBy = multipleGroupBySum(dataObj, options.data.groupBy, options.data.mesure)
            if (document.querySelector(options.targetBlocChart).querySelector(options.chart.target).closest('.chart')) {
                document.querySelector(options.targetBlocChart).querySelector(options.chart.target).closest('.chart').style.height = 'auto'
            }
            document.querySelector(options.targetBlocChart).querySelector(options.chart.target).insertAdjacentHTML('beforeend', '<div class="table-responsive mb-2"><table class="table table-hover" id="' + options.chart.name + '"><thead><tr></tr></thead><tbody></tbody></table></div>')
            options.data.label.forEach((col) => {
                document.querySelector('table#' + options.chart.name + ' thead tr').insertAdjacentHTML('beforeend', '<th data-sort-method="none" scope="col" class="table-number sort">' + col + '</th>')
            })
            dataGroupBy.forEach((obj, o) => {
                document.querySelector('table#' + options.chart.name + ' tbody').insertAdjacentHTML('beforeend', '<tr id="' + o + '"></tr>')
                options.data.mesure.forEach((mesure) => {
                    const isValid = /^[0-9,.]*$/.test(obj[mesure])
                    const isNegative = /^-[0-9,.]*$/.test(obj[mesure])
                    if ((!isValid && !isNegative) || mesure === 'numero_annee' || mesure === 'annee') {
                        document.querySelector('table#' + options.chart.name + ' tbody tr[id="' + o + '"]').insertAdjacentHTML('beforeend', "<td>" + obj[mesure] + "</td>")
                    } else {
                        if (String(obj[mesure]).includes('.')) {
                            document.querySelector('table#' + options.chart.name + ' tbody tr[id="' + o + '"]').insertAdjacentHTML('beforeend', "<td data-sort class='table-number'>" + roundDec(Number(obj[mesure]), 1).toLocaleString() + "</td>")
                        }
                        else {
                            document.querySelector('table#' + options.chart.name + ' tbody tr[id="' + o + '"]').insertAdjacentHTML('beforeend', "<td data-sort class='table-number'>" + roundDec(Number(obj[mesure]), options.data.dec).toLocaleString() + "</td>")
                        }
                    }
                })
            })
            new Tablesort(document.querySelector('table#' + options.chart.name))
        } else if (options.chart.type === 'keyNumber') {
            const dataGroupBy = multipleGroupBySum(dataObj, options.data.groupBy, options.data.mesure)
            if (dataGroupBy.length > 1) {
                console.log('Pour le type keyNumber, data ne doit retourner qu\'une ligne, pensez à filtrer les données avec options.data.customFilters')
                return
            } else if (isEmpty(dataGroupBy)) {
                const el = document.querySelector(options.targetBlocChart).querySelector(options.chart.target)
                while (el.firstChild) el.removeChild(el.firstChild)
                el.insertAdjacentHTML('beforeend', 'Non disponible')
            } else {
                const el = document.querySelector(options.targetBlocChart).querySelector(options.chart.target)
                while (el.firstChild) el.removeChild(el.firstChild)
                el.insertAdjacentHTML('beforeend', roundDec(dataGroupBy[0][options.data.mesure[0]], options.data.dec).toLocaleString() + " " + options.data.unit)
            }
        } else {
            let chart = this.chart
            if (chart) {
                chart.data.labels.length = 0
                chart.data.datasets.length = 0
                chart.update()
            } else {
                chart = this.initChart()
            }
            return this.buildChartDatasets(dataObj)
        }
    }
}

// Fix for Chart.js > 3.* ('horizontalBar' type isn't supported anymore, it's replaced by 'bar' type + datasets indexAxis property)
const typeCheck = (chartType) => {
    if (chartType === 'horizontalBar') {
        return 'bar'
    } else {
        return chartType
    }
}

/**
 * @desc Paramètres globaux des graphiques
 * 
 * @returns {Function} Affecte des paramètres globaux à tous les graphiques
 */
const chartGlobalParams = () => {
    Chart.defaults.font.family = 'Arial'
    Chart.defaults.font.size = 12
    Chart.defaults.font.color = '#666'
    Chart.defaults.animation = false
    Chart.defaults.responsive = true
    Chart.defaults.maintainAspectRatio = false
    return Chart
}

export { globalCharts, chartOptionsChecker, ChartVisualization, chartGlobalParams }