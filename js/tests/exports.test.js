const { saveFileXlsx, printDomElement } = require('../exports.js')
const assert = require('assert').strict
const { JSDOM } = require('jsdom')
const jquery = require('jquery')

describe("exports | printDomElement", function () {
    beforeEach(() => {
        const jsdom = new JSDOM(`
                <html>
                    <body>
                        <div class="col-lg-6" id="bloc-chart-1">
                            <div class="bloc-stat">
                                <div class="row stat-header">
                                    <div class="col-lg-7">
                                        <div class="stat-title">
                                            Évolution de la population de Rennes Métropole
                                        </div>
                                    </div>
                                    <div class="col-lg-5">
                                        <button class="btn btn-light control-data download-data"><img alt="Télécharger" class="icons-control-stat download-icon" src="icons/computing-cloud.svg" title="Télécharger"></button><button class="btn btn-light control-data print-data"><img alt="Imprimer" class="icons-control-stat print-icon" src="icons/photo-camera.svg" title="Imprimer"></button><button class="btn btn-light control-data full-screen" title="Agrandir"><img alt="Plein écran" class="icons-control-stat print-icon" src="https://baro.audiar.org/icons/full-size.svg"></button><a class="btn btn-light control-data share" href="/share?theme=pop&amp;idChart=bloc-chart-1" role="button" target="_blank" title="Partager l'URL"><img alt="Partager" class="icons-control-stat share-icon" src="https://baro.audiar.org/icons/share.svg"></a>
                                    </div>
                                </div>
                                <hr>
                                <div class="chart">
                                    <canvas class="chart-target" height="350" style="display: block; box-sizing: border-box; height: 350px; width: 388px;" width="388"></canvas>
                                </div>
                                <div class="source-data mt-3">
                                    Insee
                                </div>
                                <div class="footer-chart"></div>
                            </div>
                        </div>
                    </body>
                </html>
            `)
        const { window } = jsdom
        const { document } = window
        global.window = window
        global.document = document
        $ = global.$ = global.window.jQuery = jquery
    })
    it("Should be able to return the DOM bloc text content", function () {
        const titleText = document.querySelector('#bloc-chart-1').querySelector('.stat-title').textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim()
        assert.strictEqual(titleText, "Évolution de la population de Rennes Métropole")
    })
})

