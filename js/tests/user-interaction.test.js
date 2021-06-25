import * as userInteractTest from '../user-interaction.js'
const assert = require('assert').strict
const { JSDOM } = require('jsdom')
const jquery = require('jquery')
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-select'
import 'bootstrap-select/dist/css/bootstrap-select.min.css'

const html = `
    <html>
        <body>
            <div class="form-territoire" id="select-test"></div>
        </body>
    </html>
`

const urlAccess = 'https://obs-habitat.audiar.org/api/appConfig'
const urlTerritoires = 'https://obs-habitat.audiar.org/api/territoires'

describe("user-interaction | listeTerritoires", function () {
    beforeEach(() => {
        const jsdom = new JSDOM(html, { pretendToBeVisual: true })
        const { window } = jsdom
        const { document } = window
        global.window = window
        global.document = document
        $ = global.$ = global.window.jQuery = jquery
        global.fetch = require('node-fetch')
    })
    it("Should be able to load the territories selector", function () {
        return userInteractTest.listeTerritoires('#select-test', urlAccess, urlTerritoires).then(() => {
            const elTest = document.querySelector('#select-test > select.territoire-choice')
            assert.notEqual(elTest, null)
        })
    })
})