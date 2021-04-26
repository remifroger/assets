'use strict';

import { vectorOverlay } from './map-layer-loader.js'

/**
 * @desc Détecte les entités qui coupent un pixel dans la fenêtre et exécute un rappel avec chaque entité intersectée
 *
 * @param {Object} pixel - Pixel (tableau avec deux éléments [x, y])
 * @param {Object} map - Objet map instancié
 * @param {String} layerSelected - Nom de la couche qu'on souhaite intersected avec map
 * @param {String} colValue - Champ de la couche dont on souhaite récupérer la valeur
 * 
 * @returns {Array} Retourne la valeur du pixel intersecté
 */
const displayFeatureInfo = (pixel, map, layerSelected, colValue) => {
    map.getLayers().forEach(layer => {
        if (layer.get('name') && layer.get('name') == 'selection') {
            map.removeLayer(layer)
        }
    })
    const overlayLayer = vectorOverlay()
    overlayLayer.set('name', 'selection')
    map.addLayer(overlayLayer)
    const highlight_ = []
    const dataResult = []
    const feature_ = map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature
    }, {
        layerFilter: function (layer) {
            return layer.get('name') === layerSelected
        }
    })
    if (feature_) {
        dataResult.length = 0
        dataResult.push(feature_.get(colValue))
    }
    highlight_.length = 0
    highlight_.push(feature_)
    if (highlight_) {
        overlayLayer.getSource().clear()
    }
    if (feature_) {
        overlayLayer.getSource().addFeature(feature_)
    }
    return dataResult
}

export { displayFeatureInfo }