import * as navTest from '../navigation.js'
const assert = require('assert').strict
const { JSDOM } = require('jsdom')

const html = `
    <html>
        <body>
            <div class="form-territoire" id="select-test" style="display: block;"></div>
            <div id="target" style="display: none;"></div>
            <div id="parent" style="display: block;">
                <div id="child-1">
                    <div id="sub-child-1"></div>
                </div>
                <div id="child-2"></div>
            </div>
            <div class="row row-dashboard" id="row2">
                <div class="col-lg-6" id="bloc-chart-1">
                    <div class="bloc-stat">
                        <div class="row stat-header" style="display: block;">
                            <div class="col-lg-7">
                            <div class="stat-title">Évolution de la population de Rennes Métropole</div>
                            </div>
                            <div class="col-lg-5"><button class="btn btn-light control-data download-data"><img class="icons-control-stat download-icon" src="icons/computing-cloud.svg" alt="Télécharger" title="Télécharger"></button><button class="btn btn-light control-data print-data"><img class="icons-control-stat print-icon" src="icons/photo-camera.svg" alt="Imprimer" title="Imprimer"></button><a role="button" target="_blank" class="btn btn-light control-data share" title="Partager l'URL" href="/share?theme=pop&amp;idChart=bloc-chart-1"><img class="icons-control-stat share-icon" src="http://localhost:5000/icons/share.svg" alt="Partager"></a><button class="btn btn-light control-data full-screen" title="Agrandir"><img class="icons-control-stat print-icon" src="http://localhost:5000/icons/full-size.svg" alt="Plein écran"></button></div>
                        </div>
                        <hr>
                        <div class="chart" style="display: block;">
                            <canvas class="chart-target" width="785" height="437" style="display: block; box-sizing: border-box; height: 349.6px; width: 628px;"></canvas>
                        </div>
                        <div class="source-data mt-3" style="display: block;">Insee</div>
                        <div class="footer-chart" style="display: block;"></div>
                    </div>
                </div>
            </div>
        </body>
    </html>
`

describe("navigation | getUrlParameter", function () {
    beforeEach(() => {
        const jsdom = new JSDOM(html)
        const { window } = jsdom
        const { document } = window
        global.window = window
        global.document = document
        jsdom.reconfigure({
            url: 'https://baro.audiar.org/dashboard?toto=test&lolo=test1',
        })
    })
    it("Should be able to return URL parameter", function () {
        assert.strictEqual(navTest.getUrlParameter('toto'), 'test')
    })
})

describe("navigation | getAllUrlParameters", function () {
    beforeEach(() => {
        const jsdom = new JSDOM(html)
        const { window } = jsdom
        const { document } = window
        global.window = window
        global.document = document
        jsdom.reconfigure({
            url: 'https://baro.audiar.org/dashboard?toto=test&lolo=test1,test2,7',
        })
    })
    it("Should be able to return all URL parameters into object", function () {
        const resultExpected = {
            "lolo": "test1,test2,7",
            "toto": "test"
        }
        assert.deepEqual(navTest.getAllUrlParameters(), resultExpected)
    })
})

describe("navigation | waitForEl", function () {
    beforeEach(() => {
        const jsdom = new JSDOM(html)
        const { window } = jsdom
        const { document } = window
        global.window = window
        global.document = document
    })
    it("Should be able to find DOM element", function () {
        navTest.waitForEl('#select-test', () => {
            const element = document.querySelector('#select-test')
            assert.notEqual(element, null)
        })
    })
})

describe("navigation | isHidden", function () {
    beforeEach(() => {
        const jsdom = new JSDOM(html)
        const { window } = jsdom
        const { document } = window
        global.window = window
        global.document = document
    })
    it("Should be able to return false", function () {
        const element = document.querySelector('#select-test')
        assert.strictEqual(navTest.isHidden(element), false)
    })
    it("Should be able to return true", function () {
        const element = document.querySelector('#target')
        assert.strictEqual(navTest.isHidden(element), true)
    })
})