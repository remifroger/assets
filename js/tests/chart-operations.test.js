import * as chartOpTest from '../chart-operations.js'
const assert = require('assert').strict
const { expect, should } = require('chai')
const { JSDOM } = require('jsdom')
import { XMLSerializer } from 'xmldom'
const canvas = require('canvas')
import ResizeObserver from 'resize-observer-polyfill'
import MutationObserver from 'mutation-observer'
import chart from 'chart.js/dist/chart'

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
                        <canvas class="chart-target" width="400" height="400"></canvas>
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
        "sourceUrl": "https://baro.audiar.org/api/data",
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

const data = {
    "status": "success",
    "data": [
        [
            {
                "code_epci": "243500139",
                "lib_epci": "Rennes Métropole",
                "indicateur": "nb_hab",
                "annee": "2017",
                "ind_val": "447429"
            },
            {
                "code_epci": "243500139",
                "lib_epci": "Rennes Métropole",
                "indicateur": "tx_evol_an",
                "annee": "2012-2017",
                "ind_val": "1.23875918673090746600"
            },
            {
                "code_epci": "243500139",
                "lib_epci": "Rennes Métropole",
                "indicateur": "gain_annuel_hab",
                "annee": "2012-2017",
                "ind_val": "5342.4000000000000000"
            }
        ],
        [
            {
                "code_epci": "243500139",
                "lib_epci": "Rennes Métropole",
                "annee": "1990",
                "borne_temp": "1982-1990",
                "tx_evol_annuel": "1.09487324801893309300",
                "pop": "334531"
            },
            {
                "code_epci": "243500139",
                "lib_epci": "Rennes Métropole",
                "annee": "1999",
                "borne_temp": "1990-1999",
                "tx_evol_annuel": "1.24186593248758857100",
                "pop": "373833"
            },
            {
                "code_epci": "243500139",
                "lib_epci": "Rennes Métropole",
                "annee": "2008",
                "borne_temp": "1999-2008",
                "tx_evol_annuel": "0.81146845604452166400",
                "pop": "402038"
            },
            {
                "code_epci": "243500139",
                "lib_epci": "Rennes Métropole",
                "annee": "2013",
                "borne_temp": "2008-2013",
                "tx_evol_annuel": "1.18841509306985551400",
                "pop": "426502"
            },
            {
                "code_epci": "243500139",
                "lib_epci": "Rennes Métropole",
                "annee": "2018",
                "borne_temp": "2013-2018",
                "tx_evol_annuel": "1.15741553994379614200",
                "pop": "451762"
            }
        ],
        [
            {
                "code_epci": "243400017",
                "lib_epci": "Montpellier Méditerranée Métropole",
                "indicateur": "tx_evol_annuel",
                "annee_max": 2018,
                "borne_temp": "2013-2018",
                "ind_val": "1.72235344117526113300",
                "ordering": "1"
            },
            {
                "code_epci": "243400017",
                "lib_epci": "Montpellier Méditerranée Métropole",
                "indicateur": "tx_evol_annuel",
                "annee_max": 2013,
                "borne_temp": "2008-2013",
                "ind_val": "1.55324040271421741400",
                "ordering": "1"
            },
            {
                "code_epci": "244400404",
                "lib_epci": "Nantes Métropole",
                "indicateur": "tx_evol_annuel",
                "annee_max": 2018,
                "borne_temp": "2013-2018",
                "ind_val": "1.49986821102483594300",
                "ordering": "2"
            },
            {
                "code_epci": "244400404",
                "lib_epci": "Nantes Métropole",
                "indicateur": "tx_evol_annuel",
                "annee_max": 2013,
                "borne_temp": "2008-2013",
                "ind_val": "0.95795384383792040300",
                "ordering": "2"
            },
            {
                "code_epci": "243300316",
                "lib_epci": "Bordeaux Métropole",
                "indicateur": "tx_evol_annuel",
                "annee_max": 2018,
                "borne_temp": "2013-2018",
                "ind_val": "1.33643291098854784000",
                "ordering": "3"
            },
            {
                "code_epci": "243300316",
                "lib_epci": "Bordeaux Métropole",
                "indicateur": "tx_evol_annuel",
                "annee_max": 2013,
                "borne_temp": "2008-2013",
                "ind_val": "0.98804994236715091800",
                "ordering": "3"
            },
            {
                "code_epci": "243100518",
                "lib_epci": "Toulouse Métropole",
                "indicateur": "tx_evol_annuel",
                "annee_max": 2018,
                "borne_temp": "2013-2018",
                "ind_val": "1.28395519623430651800",
                "ordering": "4"
            },
            {
                "code_epci": "243100518",
                "lib_epci": "Toulouse Métropole",
                "indicateur": "tx_evol_annuel",
                "annee_max": 2013,
                "borne_temp": "2008-2013",
                "ind_val": "1.08311071353397877700",
                "ordering": "4"
            },
            {
                "code_epci": "243500139",
                "lib_epci": "Rennes Métropole",
                "indicateur": "tx_evol_annuel",
                "annee_max": 2018,
                "borne_temp": "2013-2018",
                "ind_val": "1.15741553994379614200",
                "ordering": "5"
            },
            {
                "code_epci": "243500139",
                "lib_epci": "Rennes Métropole",
                "indicateur": "tx_evol_annuel",
                "annee_max": 2013,
                "borne_temp": "2008-2013",
                "ind_val": "1.18841509306985551400",
                "ordering": "5"
            },
            {
                "code_epci": "246700488",
                "lib_epci": "Eurométropole de Strasbourg",
                "indicateur": "tx_evol_annuel",
                "annee_max": 2018,
                "borne_temp": "2013-2018",
                "ind_val": "0.74047004510217656300",
                "ordering": "6"
            },
            {
                "code_epci": "246700488",
                "lib_epci": "Eurométropole de Strasbourg",
                "indicateur": "tx_evol_annuel",
                "annee_max": 2013,
                "borne_temp": "2008-2013",
                "ind_val": "0.29670388395889562700",
                "ordering": "6"
            },
            {
                "code_epci": "200023414",
                "lib_epci": "Métropole Rouen Normandie",
                "indicateur": "tx_evol_annuel",
                "annee_max": 2018,
                "borne_temp": "2013-2018",
                "ind_val": "0.15395166065390998000",
                "ordering": "7"
            },
            {
                "code_epci": "200023414",
                "lib_epci": "Métropole Rouen Normandie",
                "indicateur": "tx_evol_annuel",
                "annee_max": 2013,
                "borne_temp": "2008-2013",
                "ind_val": "0.10937689682085116300",
                "ordering": "7"
            },
            {
                "code_epci": "200040715",
                "lib_epci": "Métropole Grenoble-Alpes-Métropole",
                "indicateur": "tx_evol_annuel",
                "annee_max": 2018,
                "borne_temp": "2013-2018",
                "ind_val": "0.10309095779385909600",
                "ordering": "8"
            },
            {
                "code_epci": "200040715",
                "lib_epci": "Métropole Grenoble-Alpes-Métropole",
                "indicateur": "tx_evol_annuel",
                "annee_max": 2013,
                "borne_temp": "2008-2013",
                "ind_val": "0.51689500453742100400",
                "ordering": "8"
            }
        ],
        [
            {
                "code_epci": "200023414",
                "a_lib_metropole": "Métropole Rouen Normandie",
                "annee": "2018",
                "borne_temp": "2013-2018",
                "a_nb_communes_n": "71",
                "a_pop_n": "492681",
                "a_gain_annuel_n_n5": "755.0",
                "a_tx_evol_annuel_n_n5": "0.15"
            },
            {
                "code_epci": "200040715",
                "a_lib_metropole": "Métropole Grenoble-Alpes-Métropole",
                "annee": "2018",
                "borne_temp": "2013-2018",
                "a_nb_communes_n": "49",
                "a_pop_n": "445059",
                "a_gain_annuel_n_n5": "457.4",
                "a_tx_evol_annuel_n_n5": "0.10"
            },
            {
                "code_epci": "243500139",
                "a_lib_metropole": "Rennes Métropole",
                "annee": "2018",
                "borne_temp": "2013-2018",
                "a_nb_communes_n": "43",
                "a_pop_n": "451762",
                "a_gain_annuel_n_n5": "5052.0",
                "a_tx_evol_annuel_n_n5": "1.16"
            },
            {
                "code_epci": "243100518",
                "a_lib_metropole": "Toulouse Métropole",
                "annee": "2018",
                "borne_temp": "2013-2018",
                "a_nb_communes_n": "37",
                "a_pop_n": "783353",
                "a_gain_annuel_n_n5": "9681.8",
                "a_tx_evol_annuel_n_n5": "1.28"
            },
            {
                "code_epci": "246700488",
                "a_lib_metropole": "Eurométropole de Strasbourg",
                "annee": "2018",
                "borne_temp": "2013-2018",
                "a_nb_communes_n": "33",
                "a_pop_n": "500510",
                "a_gain_annuel_n_n5": "3625.2",
                "a_tx_evol_annuel_n_n5": "0.74"
            },
            {
                "code_epci": "243400017",
                "a_lib_metropole": "Montpellier Méditerranée Métropole",
                "annee": "2018",
                "borne_temp": "2013-2018",
                "a_nb_communes_n": "31",
                "a_pop_n": "481276",
                "a_gain_annuel_n_n5": "7877.6",
                "a_tx_evol_annuel_n_n5": "1.72"
            },
            {
                "code_epci": "243300316",
                "a_lib_metropole": "Bordeaux Métropole",
                "annee": "2018",
                "borne_temp": "2013-2018",
                "a_nb_communes_n": "28",
                "a_pop_n": "801041",
                "a_gain_annuel_n_n5": "10289.2",
                "a_tx_evol_annuel_n_n5": "1.34"
            },
            {
                "code_epci": "244400404",
                "a_lib_metropole": "Nantes Métropole",
                "annee": "2018",
                "borne_temp": "2013-2018",
                "a_nb_communes_n": "24",
                "a_pop_n": "656275",
                "a_gain_annuel_n_n5": "9415.4",
                "a_tx_evol_annuel_n_n5": "1.50"
            }
        ],
        ""
    ]
}

describe("chart-operations | chartOptionsChecker", function () {
    beforeEach(() => {
        const jsdom = new JSDOM(html, {
            pretendToBeVisual: true,
            url: "http://localhost"
        })
        const { window } = jsdom
        const { document } = window
        global.window = window
        global.document = document
        $ = global.$ = global.window.jQuery = require('jquery')
        global.requestAnimationFrame = function () { }
        global.XMLSerializer = XMLSerializer
        global.fetch = require('node-fetch')
    })
    it("Should be able to return true", function () {
        assert.deepEqual(chartOpTest.chartOptionsChecker(chartOpts), true)
    })
})

describe("chart-operations | ChartVisualization", function () {
    let ChartClass
    beforeEach(() => {
        const jsdom = new JSDOM(html, {
            pretendToBeVisual: true,
            url: "http://localhost"
        })
        const { window } = jsdom
        const { document } = window
        global.window = window
        global.document = document
        $ = global.$ = global.window.jQuery = require('jquery')
        global.requestAnimationFrame = function () { }
        global.XMLSerializer = XMLSerializer
        global.fetch = require('node-fetch')
        const canvasMethods = ['HTMLCanvasElement']
        Object.keys(document.defaultView).forEach(property => {
            if (typeof global[property] === 'undefined') {
                global[property] = document.defaultView[property]
            }
        })
        canvasMethods.forEach(method =>
            global[method] = document.defaultView[method]
        )
        global['CanvasRenderingContext2D'] = canvas.Context2d
        global.navigator = {
            userAgent: 'node.js'
        }
        global.ResizeObserver = ResizeObserver
        global.MutationObserver = MutationObserver
        ChartClass = new chartOpTest.ChartVisualization(chartOpts)
    })
    it("ChartVisualization.dataSourceOperations should return the same clean object", function () {
        const dataTest = ChartClass.dataSourceOperations(data)
        const dataExpected = [
            {
                "code_epci": "243500139",
                "lib_epci": "Rennes Métropole",
                "annee": "1990",
                "borne_temp": "1982-1990",
                "tx_evol_annuel": "1.09487324801893309300",
                "pop": "334531"
            },
            {
                "code_epci": "243500139",
                "lib_epci": "Rennes Métropole",
                "annee": "1999",
                "borne_temp": "1990-1999",
                "tx_evol_annuel": "1.24186593248758857100",
                "pop": "373833"
            },
            {
                "code_epci": "243500139",
                "lib_epci": "Rennes Métropole",
                "annee": "2008",
                "borne_temp": "1999-2008",
                "tx_evol_annuel": "0.81146845604452166400",
                "pop": "402038"
            },
            {
                "code_epci": "243500139",
                "lib_epci": "Rennes Métropole",
                "annee": "2013",
                "borne_temp": "2008-2013",
                "tx_evol_annuel": "1.18841509306985551400",
                "pop": "426502"
            },
            {
                "code_epci": "243500139",
                "lib_epci": "Rennes Métropole",
                "annee": "2018",
                "borne_temp": "2013-2018",
                "tx_evol_annuel": "1.15741553994379614200",
                "pop": "451762"
            }
        ]
        assert.deepEqual(dataTest, dataExpected)
    })
    it("ChartVisualization.addChartComponents should load components", function () {
        const dataTest = ChartClass.dataSourceOperations(data)
        if (dataTest) {
            ChartClass.addChartComponents(dataTest)
            const elShare = document.getElementsByClassName('share')
            const elFullScreen = document.getElementsByClassName('full-screen')
            assert.notEqual(elShare, null)
            assert.notEqual(elFullScreen, null)

        }
    })
    it("ChartVisualization.compareChart should load compare module", function () {
        const dataTest = ChartClass.dataSourceOperations(data)
        if (dataTest) {
            ChartClass.compareChart()
            const elCompare = document.getElementById('compare-chart-1')
            assert.notEqual(elCompare, null)
        }
    })
    it("ChartVisualization.initChart should load Chart.js new Chart", function () {
        chartOpTest.chartGlobalParams()
        const dataTest = ChartClass.dataSourceOperations(data)
        if (dataTest) {
            ChartClass.initChart()
            const el = document.querySelector('.chart-target')
            assert.strictEqual(el.style.display, 'block')
            expect(ChartClass).to.have.property('chart')
        }
    })
    it("ChartVisualization.buildChartDatasets should load Chart.js chart datasets object", function () {
        chartOpTest.chartGlobalParams()
        const dataTest = ChartClass.dataSourceOperations(data)
        if (dataTest) {
            ChartClass.initChart()
            ChartClass.buildChartDatasets(dataTest)
            assert.deepEqual(ChartClass.chart.data.labels, ['1990', '1999', '2008', '2013', '2018'])
        }
    })
    it("ChartVisualization.buildChart should build Chart.js object", function () {
        chartOpTest.chartGlobalParams()
        const dataTest = ChartClass.dataSourceOperations(data)
        if (dataTest) {
            ChartClass.initChart()
            ChartClass.buildChart(dataTest)
            ChartClass.addChartComponents(dataTest)
            assert.deepEqual(ChartClass.chart.data.labels, ['1990', '1999', '2008', '2013', '2018'])
            const elShare = document.getElementsByClassName('share')
            const elFullScreen = document.getElementsByClassName('full-screen')
            assert.notEqual(elShare, null)
            assert.notEqual(elFullScreen, null)
        }
    })
})

describe("chart-operations | createChartAnalysis", function () {
    beforeEach(() => {
        const jsdom = new JSDOM(html, {
            pretendToBeVisual: true,
            url: "http://localhost"
        })
        const { window } = jsdom
        const { document } = window
        global.window = window
        global.document = document
        $ = global.$ = global.window.jQuery = require('jquery')
        global.requestAnimationFrame = function () { }
        global.XMLSerializer = XMLSerializer
        global.fetch = require('node-fetch')
        const canvasMethods = ['HTMLCanvasElement']
        Object.keys(document.defaultView).forEach(property => {
            if (typeof global[property] === 'undefined') {
                global[property] = document.defaultView[property]
            }
        })
        canvasMethods.forEach(method =>
            global[method] = document.defaultView[method]
        )
        global['CanvasRenderingContext2D'] = canvas.Context2d
        global.navigator = {
            userAgent: 'node.js'
        }
        global.ResizeObserver = ResizeObserver
        global.MutationObserver = MutationObserver
        chartOpTest.globalCharts.length = 0
    })
    it("createChartAnalysis should build Chart.js object from ChartVisualization class", function () {
        chartOpTest.chartGlobalParams()
        chartOpTest.createChartAnalysis(chartOpts, data)
        assert.strictEqual(chartOpTest.globalCharts.length, 1)
        expect(chartOpTest.globalCharts[0]).to.have.property('chart')
    })
})