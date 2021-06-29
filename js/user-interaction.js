'use strict';

import { multipleFiltersData } from './data-operations.js'

const valueSelected = {}

/**
 * @desc Remplissage des listes déroulantes territoriales
 *
 * @param {String} target - Nom du paramètre de l'URL (ex. : "?sParam=valeur")
 * @param {String} urlAcces - URL de l'accès
 * @param {String} urlTerritoires - URL des territoires
 * 
 * @returns {Promise} Retourne une promesse
 */
const listeTerritoires = (target, urlAccess, urlTerritoires) => {
    if ('undefined' !== typeof window.jQuery) {
        if (document.querySelector(target)) {
            document.querySelector(target).insertAdjacentHTML('beforeend', '<div class="spinner-border text-dark spinner-wip" role="status"></div>')
            const spinner = document.querySelectorAll('.spinner-wip')
            return fetch(urlAccess)
                .then(response => response.json())
                .then(result => {
                    let data
                    if (result['data']) {
                        data = result['data']
                    } else {
                        spinner.forEach(e => e.style.display = "none")
                        document.querySelector(target).insertAdjacentHTML('beforeend', '<div class="alert alert-danger no-data mt-3" role="alert">Vous n\'avez pas accès aux données géographiques, vérifiez vos droits avec l\'administrateur</div>')
                        console.log(target + ' : l\'objet data de l\'API appConfig (/api/appConfig) n\'est pas accessible')
                        return
                    }
                    if (data['access'].length) {
                        spinner.forEach(e => e.style.display = "none")
                        document.querySelector(target).insertAdjacentHTML('beforeend', '<select class="form-control territoire-choice param-choice mb-3" name="echelle" required><option value="">Choisissez un échelon géographique</option></select>')
                        document.querySelector(target).insertAdjacentHTML('beforeend', '<div class="next-option"></div><div class="help"></div>')
                        data.access.forEach((elm) => {
                            document.querySelector(target + ' .territoire-choice').insertAdjacentHTML('beforeend', '<option value=' + elm.val + ' meta=' + elm.val_meta + '>' + elm.lib + '</option>')
                        })
                        $('.territoire-choice').selectpicker({})
                        document.querySelector(target + ' select.form-control.territoire-choice').addEventListener('change', () => {
                            const helpEl = document.querySelector(target + ' > .help')
                            while (helpEl.firstChild) helpEl.removeChild(helpEl.firstChild)
                            fetch(urlTerritoires)
                                .then(response => response.json())
                                .then(data => {
                                    if (data['data']) {
                                        const optionSelected = document.querySelector(target + ' select.form-control.territoire-choice').value
                                        const selectedIndexVal = document.querySelector(target + ' select.form-control.territoire-choice').selectedIndex
                                        const optionSelectedLabel = document.querySelector(target + ' select.form-control.territoire-choice').options[selectedIndexVal].getAttribute('meta')
                                        valueSelected['meta'] = optionSelectedLabel
                                        const terrFiltered = multipleFiltersData(data['data'], { "echelle": [optionSelected], "echelle_meta": [optionSelectedLabel] })
                                        if (terrFiltered) {
                                            const optEl = document.querySelector(target + ' > .next-option')
                                            while (optEl.firstChild) optEl.removeChild(optEl.firstChild)
                                            optEl.insertAdjacentHTML('beforeend', '<select class="form-control select-' + optionSelected + optionSelectedLabel + ' param-choice codgeo mb-3" name="territoire" data-live-search="true" required><option value="">Choisissez un territoire</option></select>')
                                            terrFiltered.forEach((elm) => {
                                                document.querySelector(target).querySelector('.next-option').querySelector('.select-' + elm.echelle + elm.echelle_meta).insertAdjacentHTML('beforeend', '<option value=' + elm.code_geo + '>' + elm.lib_geo + '</option>')
                                            })
                                        } else {
                                            const optEl = document.querySelector(target + ' > .next-option')
                                            while (optEl.firstChild) optEl.removeChild(optEl.firstChild)
                                        }
                                        $('.select-' + optionSelected + optionSelectedLabel).selectpicker({
                                            maxOptions: 10
                                        })
                                        if (!document.querySelector(target).classList.contains('no-alert')) {
                                            document.querySelector(target + ' > .help').insertAdjacentHTML('beforeend', '<div class="alert">Puis choisissez une thématique</div>')
                                        }
                                    } else {
                                        document.querySelector(target).insertAdjacentHTML('beforeend', '<div class="alert alert-danger no-data mt-3" role="alert">Erreur interne, la route vers l\'API territoires (/api/territoires) n\'est pas accessible</div>')
                                        console.log(target + ' : la route vers l\'API territoires (/api/territoires) n\'est pas accessible')
                                        return
                                    }
                                })
                                .catch(() => {
                                    document.querySelector(target).insertAdjacentHTML('beforeend', '<div class="alert alert-danger no-data mt-3" role="alert">Erreur interne</div>')
                                    console.log(target + ' : /api/territoires n\'est pas accessible')
                                    return
                                })
                        })
                    } else {
                        spinner.forEach(e => e.style.display = "none")
                        document.querySelector(target).insertAdjacentHTML('beforeend', '<div class="alert alert-danger no-data mt-3" role="alert">Vous n\'avez pas accès aux données géographiques, vérifiez vos droits avec l\'administrateur</div>')
                        console.log(target + ' : la route vers la configuration (/api/appConfig) contenant les accès (territoires_access.json) n\'existe pas, vérifiez les droits attribués')
                        return
                    }
                })
                .catch(() => {
                    spinner.forEach(e => e.style.display = "none")
                    document.querySelector(target).insertAdjacentHTML('beforeend', '<div class="alert alert-danger no-data mt-3" role="alert">Erreur interne</div>')
                    return
                })
        }
    } else {
        console.log("jQuery est requis pour l'affichage de la sélection de territoires")
        return
    }
}

export { valueSelected, listeTerritoires }