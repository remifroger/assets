import * as mapAnalysisTest from '../map-analysis.js'
import * as mapInit from '../map-init.js'
import * as mapLoader from '../map-layer-loader.js'
const assert = require('assert').strict
const should = require('chai').should()
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

const analysisOpts = {
    "theme": "Population",
    "title": "Limites communales",
    "dateCol": "",
    "type": {
        "mode": "Polygone",
        "methode": "Qualitatif",
        "qualitatifObj": [
            {
                "val": [
                    1
                ],
                "text_legende": "Limites communales",
                "color_stroke": "rgba(150, 150, 150, 0.5)",
                "stroke_width": 1.5,
                "color_fill": "rgba(255, 255, 255, 0)"
            }
        ]
    },
    "data": {
        "layer": "communes_geo",
        "source": "Interne",
        "sourceUrl": null,
        "params": {},
        "index": null,
        "geoCol": "code_insee_concat",
        "geoColBasemap": "code_insee_concat",
        "customFilters": {},
        "groupBy": null
    },
    "mesure": "statut",
    "exceptions": {
        "label": null,
        "val": []
    },
    "blocMapTarget": "#bloc-map-1",
    "selectTarget": ".map-analyses",
    "legendTarget": ".legend-content",
    "downloadButtonTarget": ".download-data",
    "printButtonTarget": ".print-data"
}

const data = [
    {
        "id_com": 3687,
        "code_insee_concat": "35166",
        "lib_com": "Marpiré",
        "statut": 1,
        "date_insert_pgsql": "2018-09-07T13:28:06.037Z",
        "code_armature_urbaine_doo": "ZZ",
        "lib_armature_urbaine_doo": "Sans objet",
        "code_arr": "351",
        "lib_arr": "Fougères-Vitré",
        "code_au1999": "012",
        "lib_au1999": "Rennes",
        "code_au2010": "011",
        "lib_au2010": "Rennes",
        "code_bv2012": "35068",
        "lib_bv2012": "Châteaubourg",
        "code_canton": "3527 ",
        "lib_canton": "Vitré",
        "code_dep": "35 ",
        "lib_dep": "Ille-et-Vilaine",
        "code_epci": "200039022",
        "lib_epci": "CA Vitré Communauté",
        "code_uu2010": "35000",
        "lib_uu2010": "Communes rurales du département 35",
        "code_ze2010": "5312",
        "lib_ze2010": "Rennes",
        "code_rm_secteur": "ZZ",
        "lib_rm_secteur": "Sans objet",
        "code_reg": "53",
        "lib_reg": "Bretagne"
    },
    {
        "id_com": 12614,
        "code_insee_concat": "35101",
        "lib_com": "Dourdain",
        "statut": 1,
        "date_insert_pgsql": "2018-09-07T13:28:06.037Z",
        "code_armature_urbaine_doo": "PP",
        "lib_armature_urbaine_doo": "Pôle de proximité",
        "code_arr": "353",
        "lib_arr": "Rennes",
        "code_au1999": "012",
        "lib_au1999": "Rennes",
        "code_au2010": "011",
        "lib_au2010": "Rennes",
        "code_bv2012": "35253",
        "lib_bv2012": "Saint-Aubin-du-Cormier",
        "code_canton": "3513 ",
        "lib_canton": "Liffré",
        "code_dep": "35 ",
        "lib_dep": "Ille-et-Vilaine",
        "code_epci": "243500774",
        "lib_epci": "CC Liffré-Cormier Communauté",
        "code_uu2010": "35000",
        "lib_uu2010": "Communes rurales du département 35",
        "code_ze2010": "5312",
        "lib_ze2010": "Rennes",
        "code_rm_secteur": "ZZ",
        "lib_rm_secteur": "Sans objet",
        "code_reg": "53",
        "lib_reg": "Bretagne"
    }
]

const layersOpts = {
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

describe("map-analysis | mapOptionsChecker", function () {
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
    it("Should be able to return true", function () {
        assert.deepEqual(mapAnalysisTest.mapOptionsChecker(analysisOpts), true)
    })
})

describe("map-analysis | MapAnalysis", function () {
    let MapClass
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
        MapClass = new mapAnalysisTest.MapAnalysis(1, analysisOpts)
    })
    it("MapAnalysis.dataSourceOperations should return the same clean object", function () {
        const dataTest = MapClass.dataSourceOperations(data)
        assert.deepEqual(dataTest, data)
    })
    it("MapAnalysis.addMapComponents should load components", function () {
        const dataTest = MapClass.dataSourceOperations(data)
        if (dataTest) {
            MapClass.addMapComponents(dataTest)
            const element = document.getElementsByClassName('share-control')
            assert.notEqual(element, null)
        }
    })
    it("MapAnalysis.cartoClassification should load analysis legend", function () {
        const dataTest = MapClass.dataSourceOperations(data)
        if (dataTest) {
            MapClass.addMapComponents(dataTest)
            MapClass.cartoClassification(dataTest)
            assert.strictEqual(mapAnalysisTest.globalAnalyzes.length, 3)
            mapAnalysisTest.globalAnalyzes[2].should.include.keys('legendeProperties')
            mapAnalysisTest.globalAnalyzes[2].legendeProperties.should.include.keys('legende')
        }
    })
})

describe("map-analysis | MapAnalysis", function () {
    let MapClass
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
        mapAnalysisTest.globalAnalyzes.length = 0
        MapClass = new mapAnalysisTest.MapAnalysis(1, analysisOpts)
    })
    it("MapAnalysis.buildStyle should create analysis", function () {
        const map = mapInit.loadMap('map')
        const layers = []
        mapLoader.addLayers(geoConf, map, layers, [{ champ: "code_epci", val: "243500139" }])
        const dataTest = MapClass.dataSourceOperations(data)
        if (dataTest) {
            MapClass.addMapComponents(dataTest)
            MapClass.cartoClassification(dataTest)
            MapClass.apply = function () {
                return MapClass.buildStyle(dataTest, map, layersOpts)
            }
            mapAnalysisTest.globalAnalyzes[0].should.include.keys('apply')
            mapAnalysisTest.globalAnalyzes[0]['apply'].should.be.a('function')
            mapAnalysisTest.globalAnalyzes[0].apply()
        }
    })
})

describe("map-analysis | createMapAnalysis", function () {
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
        mapAnalysisTest.globalAnalyzes.length = 0
    })
    it("createMapAnalysis should create analysis", function () {
        const map = mapInit.loadMap('map')
        const layers = []
        mapLoader.addLayers(geoConf, map, layers, [{ champ: "code_epci", val: "243500139" }])
        mapAnalysisTest.createMapAnalysis(1, analysisOpts, data, map, layersOpts)
    })
})