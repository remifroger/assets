'use strict';

/**
 * @desc Défile vers un élément du DOM
 *
 * @param {String} button - Elément du DOM déclenchant le défilement
 * @param {String} target - Elément du DOM visé
 * 
 * @returns {Function} Retourne le défilement vers target à partir de button
 */
const goToElement = (button, target) => {
    if (document.querySelector(target) && document.querySelector(button)) {
        document.querySelectorAll(button).forEach(el => {
            el.addEventListener('click', function (event) {
                event.preventDefault()
                document.querySelector(target).scrollIntoView({
                    behavior: "smooth"
                })
            })
        })
    }
}

/**
 * @desc Défile vers le haut de page
 *
 * @param {String} target - Elément du DOM déclenchant le défilement
 * 
 * @returns {Function} Retourne le défilement vers le haut la page
 */
const scrollToTop = (target) => {
    if (document.querySelector(target)) {
        window.onscroll = function () { scrollFunction() }
        const scrollFunction = () => {
            if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                document.querySelector(target).style.display = "block"
            } else {
                document.querySelector(target).style.display = "none"
            }
        }
        document.querySelector(target).addEventListener('click', () => {
            document.body.scrollTop = 0 // pour Safari
            document.documentElement.scrollTop = 0 // pour Chrome, Firefox, IE et Opera
        })
    }
}

/**
 * @desc Active des fonctionnalités Bootstrap - jQuery required
 *
 * @returns {Function} Retourne l'activation de fonctionnalités Bootstrap
 */
const bootstrapToolsActivate = () => {
    if ('undefined' !== typeof window.jQuery) {
        $('[data-toggle="tooltip"]').tooltip()
    } else {
        console.log("jQuery est requis pour activer les tooltips")
        return
    }
}

/**
 * @desc Récupère la valeur d'un paramètre de l'URL
 *
 * @param {String} sParam - Nom du paramètre de l'URL (ex. : "?sParam=valeur")
 * 
 * @returns {String} Retourne la valeur du paramètre de l'URL 
 */
const getUrlParameter = (sParam) => {
    let sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=')
        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1])
        }
    }
}

/**
 * @desc Récupère tous les paramètres de l'URL
 *
 * @returns {Array} Retourne tous les paramètres de l'URL
 */
const getAllUrlParameters = () => {
    const foo = window.location.href.split('?')[1].split('#')[0].split('&')
    const dict = {}
    let elem = []
    for (var i = foo.length - 1; i >= 0; i--) {
        elem = foo[i].split('=')
        dict[elem[0]] = elem[1]
    }
    return dict
}

/**
 * @desc Récupère un élément du DOM, puis transmet les résultats à une fonction de rappel
 *
 * @param {String} selector - Elément du DOM dont on attend le retour
 * @param {requestCallback} callback - Rappel qui gère la réponse
 */
const waitForEl = (selector, callback) => {
    if (document.querySelector(selector)) {
        callback()
    } else {
        setTimeout(function () {
            waitForEl(selector, callback)
        }, 100)
    }
}

/**
 * @desc Affiche un élément du DOM en plein écran
 *
 * @param {String} button - Elément du DOM déclenchant la fonction
 * @param {String} target - Elément du DOM qu'on souhaite afficher en plein écran
 * 
 * @returns {Function} Retourne
 */
const fullScreen = (button, target) => {
    document.querySelector(target).querySelector(button).addEventListener('click', (event) => {
        event.preventDefault()
        const element = document.querySelector(target)
        if (
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        ) {
            if (document.exitFullscreen) {
                document.exitFullscreen()
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen()
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen()
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen()
            }
        } else {
            if (element.requestFullscreen) {
                element.requestFullscreen()
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen()
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen()
            }
        }
    })
}

/**
 * @desc Cacher un élément du DOM
 *
 */
const isHidden = (el) => {
    const style = window.getComputedStyle(el)
    return (style.display === 'none')
}

const hideChildrenFromEl = (el) => {
    if (el.childNodes[0]) {
        const subEl = el.childNodes[0].childNodes
        subEl.forEach((sub) => {
            sub.style.display = 'none'
        })
    }
}

const showChildrenFromEl = (el) => {
    if (el.childNodes[0]) {
        const subEl = el.childNodes[0].childNodes
        subEl.forEach((sub) => {
            sub.style.display = 'block'
        })
    }
}

export { goToElement, scrollToTop, bootstrapToolsActivate, getUrlParameter, getAllUrlParameters, waitForEl, fullScreen, isHidden, hideChildrenFromEl, showChildrenFromEl }