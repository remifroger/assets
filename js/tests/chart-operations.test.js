import * as chartOpTest from '../chart-operations.js'
const assert = require('assert').strict
const should = require('chai').should()
const { JSDOM } = require('jsdom')
import { XMLSerializer } from 'xmldom'

const html = `
    <html>
        <body>
            <div class="col-lg-6" id="bloc-chart-1">
                <div class="bloc-stat">
                    <div class="row stat-header">
                        <div class="col-lg-7">
                            <div class="stat-title"></div>
                        </div>
                        <div class="col-lg-5">
                            <button class="btn btn-light control-data download-data"><img class="icons-control-stat download-icon" src="icons/computing-cloud.svg" alt="Télécharger" title="Télécharger"></button>
                            <button class="btn btn-light control-data print-data"><img class="icons-control-stat print-icon" src="icons/photo-camera.svg" alt="Imprimer" title="Imprimer"></button>
                        </div>
                    </div>
                    <hr>
                    <div class="chart">
                        <canvas class="chart-target"></canvas>
                    </div>
                    <div class="source-data mt-3">Insee</div>
                    <div class="footer-chart"></div>
                </div>
            </div>
        </body>
    </html>
`

const chartOpts = {
    "targetBlocChart": "#bloc-chart-1",
    "chart": {
        "target": ".chart-target",
        "downloadButtonTarget": ".download-data",
        "printButtonTarget": ".print-data",
        "type": "bar",
        "options": "chartClassicBar",
        "name": "chart-1",
        "title": {
            "target": ".stat-title",
            "text": "Évolution de la population de Rennes Métropole",
            "dateCol": ""
        },
        "icon": {
            "target": "",
            "val": ""
        },
        "source": {
            "target": ".source-data",
            "text": "Insee"
        },
        "compare": false,
        "filter": {
            "active": false,
            "col": null,
            "alias": null
        },
        "customColor": {
            "active": false,
            "type": null,
            "objColors": null
        }
    },
    "data": {
        "sourceUrl": "/api/data",
        "params": {
            "theme": "pop"
        },
        "customFilters": {
        },
        "index": 1,
        "label": [
            "lib_epci"
        ],
        "groupBy": ["annee", "lib_epci"],
        "mesure": [
            "pop"
        ],
        "unit": "",
        "dec": 0,
        "backgroundColor": [
            "rgba(93, 79, 156, 0.3)"
        ],
        "borderColor": [],
        "width": 0
    }
}

describe("chart-operations | chartOptionsChecker", function () {
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
        assert.deepEqual(chartOpTest.chartOptionsChecker(chartOpts), true)
    })
})

/*
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
})*/