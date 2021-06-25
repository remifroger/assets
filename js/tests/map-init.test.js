import * as mapInit from '../map-init.js'
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

describe("map-init | loadMap", function () {
    beforeEach(() => {
        const jsdom = new JSDOM(html, { pretendToBeVisual: true })
        const { window } = jsdom
        const { document } = window
        global.window = window
        global.document = document
        global.requestAnimationFrame = function () {}
        global.XMLSerializer = XMLSerializer
    })
    it("loadMap should be able to return OL map instantiated", function () {
        const map = mapInit.loadMap('map')
        assert.strictEqual(map.getTarget(), 'map')
        assert.notEqual(document.querySelector('#map').querySelector('.ol-viewport'), null)
    })
})