'use strict';

/**
 * @desc Vérifie si une couche vecteur est vide ou non
 *
 * @param {Object} vect - Couche vecteur
 * 
 * @returns {Boolean} Retourne true si la source est vide
 */
const getLengthVector = (vect) => {
    const sourceFeatures = vect.getSource().getFeatures()
    if (sourceFeatures.length == 0) {
        return true
    }
    if (sourceFeatures.length > 0) {
        return false
    }
}

export { getLengthVector }