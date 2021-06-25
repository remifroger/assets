import * as mapInit from '../map-init.js'
import * as mapLoader from '../map-layer-loader.js'
import * as mapBackground from '../map-basemap.js'
const assert = require('assert').strict
const { JSDOM } = require('jsdom')
import { XMLSerializer } from 'xmldom'

const html = `
    <html>
        <body>
            <div class="col-lg-12" id="bloc-map-1">
                <div class="bloc-stat">
                    <div class="row stat-header">
                        <div class="col-lg-7">
                            <div class="stat-title">Analyses cartographiques</div>
                        </div>
                        <div class="col-lg-5">
                            <button class="btn btn-light control-data download-data">
                                <img class="icons-control-stat download-icon" src="icons/computing-cloud.svg" alt="Télécharger">
                            </button>
                            <button class="btn btn-light control-data print-data">
                                <img class="icons-control-stat print-icon" src="icons/photo-camera.svg" alt="Imprimer">
                            </button>
                        </div>
                    </div>
                    <hr>
                    <div id="map"></div>
                    <div id="popup"></div>
                    <div class="row control-map">
                        <div class="col-lg-6">
                            <div class="text-muted mb-2 mt-2">Choix de l'indicateur</div>
                            <hr>
                            <div class="map-analyses-select">
                                <select class="form-control map-analyses"></select>
                            </div>
                        </div>
                        <div class="col-lg-6"><div id="legend-map">
                            <div class="legend-content mt-2"></div>
                        </div>
                    </div>
                    <div class="footer-chart"></div>
                </div>
            </div>
        </body>
    </html>
`

const geoConf = {
    "url": "https://geoserver.audiar.org/geoserver/wfs",
    "nameSpacePublic": "dataudiar",
    "proj": "EPSG:3857",
    "layers": [
        {
            "id": "communes",
            "path": "d_territoires_communes_join_all_mv",
            "name": "communes_geo",
            "filter": true,
            "interaction": {
                "click": {
                    "style": "panel",
                    "target": ".com",
                    "label": "lib_com"
                },
                "mouseover": {
                    "target": "#popup",
                    "label": "lib_com"
                },
                "geoLevelParamName": "echelle",
                "geoLevelParamValue": "commune",
                "geoValueParamName": "territoire"
            }
        }
    ]
}

describe("map-layer-loader | vectorOverlay", function () {
    beforeEach(() => {
        const jsdom = new JSDOM(html, { pretendToBeVisual: true })
        const { window } = jsdom
        const { document } = window
        global.window = window
        global.document = document
        $ = global.$ = global.window.jQuery = require('jquery')
        global.requestAnimationFrame = function () {}
        global.XMLSerializer = XMLSerializer
        global.fetch = require('node-fetch')
    })
    it("vectorOverlay should be able to return one layer", function () {
        const map = mapInit.loadMap('map')
        const layersStorage = []
        const overlayLayer = mapLoader.vectorOverlay()
        overlayLayer.set('name', 'selection')
        map.addLayer(overlayLayer)
        layersStorage.push(overlayLayer)
        assert.strictEqual(layersStorage.length, 1)
    })
})

describe("map-layer-loader | baseMap", function () {
    beforeEach(() => {
        const jsdom = new JSDOM(html, { pretendToBeVisual: true })
        const { window } = jsdom
        const { document } = window
        global.window = window
        global.document = document
        $ = global.$ = global.window.jQuery = require('jquery')
        global.requestAnimationFrame = function () {}
        global.XMLSerializer = XMLSerializer
        global.fetch = require('node-fetch')
    })
    it("baseMap should be able to return one layer", function () {
        const map = mapInit.loadMap('map')
        const layersStorage = []
        const baseLayer = mapLoader.baseMap(mapBackground.cartoPositron)
        map.addLayer(baseLayer)
        layersStorage.push(baseLayer)
        assert.strictEqual(layersStorage.length, 1)
    })
})

describe("map-layer-loader | addLayers", function () {
    beforeEach(() => {
        const jsdom = new JSDOM(html, { pretendToBeVisual: true })
        const { window } = jsdom
        const { document } = window
        global.window = window
        global.document = document
        $ = global.$ = global.window.jQuery = require('jquery')
        global.requestAnimationFrame = function () {}
        global.XMLSerializer = XMLSerializer
        global.fetch = require('node-fetch')
    })
    it("addLayers should be able to return one layer", function () {
        const map = mapInit.loadMap('map')
        const layers = []
        mapLoader.addLayers(geoConf, map, layers, [{ champ: "code_epci", val: "243500139" }])
        assert.strictEqual(layers.length, 1)
    })
})