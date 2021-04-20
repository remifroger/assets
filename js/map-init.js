'use strict';

import Map from 'ol/Map'
import View from 'ol/View'
import { get as getProjection } from 'ol/proj'

/** @global Valeur du pas de zoom */
const _zoomFactorDelta = 1

/**
 * @desc Instanciation d'une carte OpenLayers
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html|OpenLayers}
 *
 * @param {String} target - Elément du DOM pointant sur la carte
 * 
 * @returns {Object} Retourne l'objet map
 */
const loadMap = (target) => {
    const map = new Map({
        target: target,
        layers: [],
        view: new View({
            projection: getProjection('EPSG:3857'),
            center: [0, 0],
            //zoomFactor: Math.pow(2, 1 / _zoomFactorDelta), // ajuster _zoomFactorDelta pour avoir un pas de zoom plus fin si besoin
            zoom: 3
        })
    })
    return map
}

export { _zoomFactorDelta, loadMap }