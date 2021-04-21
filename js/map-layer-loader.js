'use strict';

import XYZ from 'ol/source/XYZ'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import { WFS, GeoJSON } from 'ol/format'
import { Stroke, Style } from 'ol/style'
import { equalTo as equalToFilter } from 'ol/format/filter'

/**
 * @desc Charge une couche géographique (vecteur)
 *
 * @param {Object} mapFit - Objet map instancié
 * @param {Object} options - Liste des champs de l'objet sur lesquels on souhaite grouper
 * @param {String} options.url - URL du flux GeoServer (ex. : https://geoserver.audiar.org/geoserver/wfs) 
 * @param {String} options.nameSpace - Entrepôt (nameSpace) GeoServer contenant le flux 
 * @param {String} options.projection - Projection (ex. : 'EPSG:3857')
 * @param {?Function} options.filters - Filtres à appliquer (voir : https://openlayers.org/en/latest/apidoc/module-ol_format_filter.html)
 * 
 * @returns {Object} Retourne la couche OpenLayers
 */
const loader = (mapFit, options) => {
	const vectorSource = new VectorSource()
	const vector = new VectorLayer({
		source: vectorSource
	})
	const featureRequest = new WFS().writeGetFeature({
		srsName: options.projection,
		featurePrefix: options.nameSpace,
		featureTypes: [options.layer],
		outputFormat: 'application/json',
		filter: options.filters
	})
	// Then post the request and add the received features to a layer
	fetch(options.url, {
		method: 'POST',
		body: new XMLSerializer().serializeToString(featureRequest)
	}).then(function (response) {
		return response.json()
	}).then(function (json) {
		const features = new GeoJSON().readFeatures(json)
		vectorSource.addFeatures(features)
		mapFit.getView().fit(vectorSource.getExtent())
	}).catch(function (error) {
		console.log('[' + options.layer + '] Il y a eu un problème avec l\'opération fetch : ' + error.message)
		return
	})
	return vector
}

/**
 * @desc Charge une couche vecteur "fictive" vide avec un style contour
 *
 * @returns {Object} Retourne la couche OpenLayers
 */
const vectorOverlay = () => {
	const overlayLayer = new VectorLayer({
		source: new VectorSource(),
		style: function () {
			const highlightStyleCache = new Style({
				stroke: new Stroke({
					color: '#3b00c1',
					width: 4
				})
			})
			return highlightStyleCache
		}
	})
	return overlayLayer
}

/**
 * @desc Charge un fond de carte
 *
 * @param {?Array} options[].url - Liste des valeurs
 * @param {String} options[].attribution - Attribution du fond de carte 
 * @returns {Object} Retourne le fond de carte
 */
const baseMap = (options) => {
	const baseMap = new TileLayer({
		source: new XYZ({
			url: options.url,
			attributions: options.attribution,
			crossOrigin: "Anonymous"
		})
	})
	return baseMap
}

const addLayers = (configGeo, map, layersAdded, filters) => {
	let olFilters
	if (filters.length === 1) {
		olFilters = equalToFilter(filters[0].champ, filters[0].val)
	} else {
		console.log("Seulement un filtre est autorisé")
		return
	}
	configGeo.layers.forEach((item) => {
		const options = {
			url: configGeo.url,
			nameSpace: configGeo.nameSpacePublic,
			layer: item.path,
			projection: configGeo.proj,
			filters: (item.filter) ? olFilters : null
		}
		window[item.id] = loader(map, options)
		window[item.id].set('name', item.name)
		map.addLayer(window[item.id])
		layersAdded.push(window[item.id])
	})
}

export { loader, vectorOverlay, baseMap, addLayers }