'use strict';

import { roundDec } from './data-operations.js'

/**
 * @desc Génère les options d'un graphique Chart (dépend de Chart.js)
 * @see {@link https://www.chartjs.org/docs/3.1.0/general/options.html}
 *
 * @param @param {Object} optFromChartConf - Options du graphique (voir chart-operations.js | optionsChecker()) 
 * 
 * @returns {Object} Retourne les options
 */
const chartOpts = (optFromChartConf) => {
    /**
     * @desc Options d'un graphique de type 'bar' (voir la documentation Chart.js pour les propriétés possibles)
     * @typedef {Object} chartClassicBar
     * @see {@link https://www.chartjs.org/docs/latest/charts/bar.html|Chart.js}
     */
    const chartClassicBar = {
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: false
                }
            },
            x: {
                beginAtZero: true,
                grid: {
                    display: false
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.dataset.label
                        const value = context.dataset.data[context.dataIndex]
                        return label + ' : ' + value.toLocaleString()
                    }
                }
            },
            datalabels: {
                formatter: function (value) {
                    return value.toLocaleString()
                },
                anchor: 'middle',
                align: 'middle',
                display: 'auto',
                font: {
                    size: '10'
                }
            }
        }
    }

    /**
     * @desc Options d'un graphique de type 'bar' avec pourcentages (voir la documentation Chart.js pour les propriétés possibles)
     * @typedef {Object} chartClassicBarPercent
     * @see {@link https://www.chartjs.org/docs/latest/charts/bar.html|Chart.js}
     */
    const chartClassicBarPercent = {
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: false
                }
            },
            x: {
                beginAtZero: true,
                grid: {
                    display: false
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.dataset.label
                        const value = context.dataset.data[context.dataIndex]
                        return label + ' : ' + value.toLocaleString() + ' %'
                    }
                }
            },
            datalabels: {
                formatter: function (value) {
                    return value.toLocaleString() + ' %'
                },
                anchor: 'middle',
                align: 'middle',
                display: 'auto',
                font: {
                    size: '10'
                }
            }
        }
    }

    /**
     * @desc Options d'un graphique de type 'line' (voir la documentation Chart.js pour les propriétés possibles)
     * @typedef {Object} chartLine
     * @see {@link https://www.chartjs.org/docs/latest/charts/line.html|Chart.js}
     */
    const chartLine = {
        scales: {
            x: {
                stacked: true,
                grid: {
                    display: false
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    display: false
                }
            }
        },
        beginAtZero: true,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.dataset.label
                        const value = context.dataset.data[context.dataIndex]
                        return label + ' : ' + value.toLocaleString()
                    }
                }
            },
            legend: {
                labels: {
                    usePointStyle: true,
                }
            },
            datalabels: {
                formatter: function (value) {
                    return value.toLocaleString()
                },
                padding: '6',
                anchor: 'middle',
                align: 'bottom',
                display: 'auto',
                font: {
                    size: '10'
                }
            }
        }
    }

    /**
     * @desc Options d'un graphique de type 'line' avec pourcentages (voir la documentation Chart.js pour les propriétés possibles)
     * @typedef {Object} chartLinePercent
     * @see {@link https://www.chartjs.org/docs/latest/charts/line.html|Chart.js}
     */
    const chartLinePercent = {
        scales: {
            x: {
                stacked: true,
                grid: {
                    display: false
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    display: false
                }
            }
        },
        beginAtZero: true,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.dataset.label
                        const value = context.dataset.data[context.dataIndex]
                        return label + ' : ' + value.toLocaleString() + ' %'
                    }
                }
            },
            legend: {
                labels: {
                    usePointStyle: true,
                }
            },
            datalabels: {
                formatter: function (value) {
                    return value.toLocaleString() + ' %'
                },
                padding: '6',
                anchor: 'middle',
                align: 'bottom',
                display: 'auto',
                font: {
                    size: '10'
                }
            }
        }
    }

    /**
     * @desc Options d'un graphique 'stacked' (compatible avec le type 'bar' ou 'horizontalBar') (voir la documentation Chart.js pour les propriétés possibles)
     * @typedef {Object} chartStackedSum
     * @see {@link https://www.chartjs.org/docs/latest/charts/bar.html|Chart.js}
     */
    const chartStackedSum = {
        scales: {
            x: {
                stacked: true,
                grid: {
                    display: false
                }
            },
            y: {
                stacked: true,
                ticks: {
                    beginAtZero: true,
                },
                grid: {
                    drawBorder: true,
                    display: false
                }
            }
        },
        beginAtZero: true,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    afterTitle: function () {
                        window.total = 0
                    },
                    label: function (context) {
                        const label = context.dataset.label
                        const value = context.dataset.data[context.dataIndex]
                        window.total += value
                        return label + " : " + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                    },
                    footer: function () {
                        return "Total : " + roundDec(window.total, 2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                    }
                }
            },
            datalabels: {
                formatter: function (value) {
                    if (value > 0) {
                        return value.toLocaleString()
                    } else {
                        return null
                    }
                },
                anchor: 'middle',
                align: 'middle',
                display: 'auto',
                font: {
                    size: '10'
                }
            }
        }
    }

    /**
     * @desc Options d'un graphique de type 'stacked' avec pourcentages et maximum fixé à 100 (compatible avec le type 'bar' ou 'horizontalBar') (voir la documentation Chart.js pour les propriétés possibles)
     * @typedef {Object} chartStackedSumPercent100
     * @see {@link https://www.chartjs.org/docs/latest/charts/bar.html|Chart.js}
     */
    const chartStackedPercent100 = {
        scales: {
            x: {
                stacked: true,
                grid: {
                    display: false
                },
                min: 0,
                max: 100,
            },
            y: {
                stacked: true,
                ticks: {
                    beginAtZero: true,
                },
                grid: {
                    drawBorder: true,
                    display: false
                },
                min: 0,
                max: 100,
            }
        },
        beginAtZero: true,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    afterTitle: function () {
                        window.total = 0
                    },
                    label: function (context) {
                        const label = context.dataset.label
                        const value = context.dataset.data[context.dataIndex]
                        window.total += value
                        return label + " : " + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' %'
                    }
                }
            },
            datalabels: {
                formatter: function (value) {
                    return value.toLocaleString() + ' %'
                },
                anchor: 'middle',
                align: 'middle',
                display: 'auto',
                font: {
                    size: '10'
                }
            }
        }
    }

    /**
     * @desc Options d'un graphique de type 'stacked' avec pourcentages (compatible avec le type 'bar' ou 'horizontalBar') (voir la documentation Chart.js pour les propriétés possibles)
     * @typedef {Object} chartStackedSumPercent
     * @see {@link https://www.chartjs.org/docs/latest/charts/bar.html|Chart.js}
     */
    const chartStackedPercent = {
        scales: {
            x: {
                stacked: true,
                grid: {
                    display: false
                },
            },
            y: {
                stacked: true,
                ticks: {
                    beginAtZero: true,
                },
                grid: {
                    drawBorder: true,
                    display: false
                },
            }
        },
        beginAtZero: true,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    afterTitle: function () {
                        window.total = 0
                    },
                    label: function (context) {
                        const label = context.dataset.label
                        const value = context.dataset.data[context.dataIndex]
                        window.total += value
                        return label + " : " + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' %'
                    }
                }
            },
            datalabels: {
                formatter: function (value) {
                    return value.toLocaleString() + ' %'
                },
                anchor: 'middle',
                align: 'middle',
                display: 'auto',
                font: {
                    size: '10'
                }
            }
        }
    }

    /**
     * @desc Options d'un graphique de type 'bar' ou 'horizontalBar' en pyramide (voir la documentation Chart.js pour les propriétés possibles)
     * @typedef {Object} chartPyramide
     * @see {@link https://www.chartjs.org/docs/latest/charts/bar.html|Chart.js}
     */
    const chartPyramide = {
        scales: {
            x: {
                stacked: true,
                grid: {
                    display: false
                },
                ticks: {
                    callback: function (value) {
                        return Math.abs(value).toLocaleString()
                    },
                },

            },
            y: {
                stacked: true,
                beginAtZero: true,
                grid: {
                    drawBorder: true,
                    display: false
                }
            }
        },
        beginAtZero: true,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.dataset.label
                        const value = context.dataset.data[context.dataIndex]
                        return label + ' : ' + Math.abs(value).toLocaleString()
                    }
                }
            },
            datalabels: {
                formatter: function (value) {
                    return Math.abs(value).toLocaleString()
                },
                anchor: function (context) {
                    return context.dataset.data[context.dataIndex] < 0 ? 'start' : 'end'
                },
                align: function (context) {
                    return context.dataset.data[context.dataIndex] < 0 ? 'start' : 'end'
                },
                display: 'auto',
                font: {
                    size: '10'
                }
            }
        }
    }

    /**
     * @desc Options d'un graphique de type 'horizontalBar' (voir la documentation Chart.js pour les propriétés possibles)
     * @typedef {Object} chartHorizontal
     * @see {@link https://www.chartjs.org/docs/latest/charts/bar.html|Chart.js}
     */
    const chartHorizontal = {
        scales: {
            x: {
                grid: {
                    display: false
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    drawBorder: true,
                    display: false
                }
            }
        },
        beginAtZero: true,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.dataset.label
                        const value = context.dataset.data[context.dataIndex]
                        return label + ' : ' + value.toLocaleString() + ' %'
                    }
                }
            },
            datalabels: {
                formatter: function (value) {
                    return value.toLocaleString()
                },
                anchor: 'end',
                align: 'end',
                display: 'auto',
                font: {
                    size: '10'
                }
            }
        }
    }

    /**
     * @desc Options d'un graphique de type 'doughnut' (voir la documentation Chart.js pour les propriétés possibles)
     * @typedef {Object} chartClassicDoughnut
     * @see {@link https://www.chartjs.org/docs/latest/charts/doughnut.html|Chart.js}
     */
    const chartClassicDoughnut = {
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const dataset = context.dataset
                        const total = dataset.data.reduce((a, b) => a + b, 0)
                        const currentValue = dataset.data[context.dataIndex]
                        const percentage = roundDec((currentValue / total * 100), 1).toLocaleString()
                        return Number(currentValue).toLocaleString() + ' (' + percentage + ' %)'
                    },
                    title: function (context) {
                        return context[0].label
                    }
                }
            },
            datalabels: {
                formatter: function (value) {
                    return value.toLocaleString()
                },
                anchor: 'middle',
                align: 'middle',
                display: 'auto',
                font: {
                    size: '10'
                }
            }
        }
    }

    /**
     * @desc Options d'un graphique de type 'doughnut' avec pourcentages (voir la documentation Chart.js pour les propriétés possibles)
     * @typedef {Object} chartClassicDoughnut
     * @see {@link https://www.chartjs.org/docs/latest/charts/doughnut.html|Chart.js}
     */
    const chartDoughnutPercent = {
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.dataset.label
                        const value = context.dataset.data[context.dataIndex]
                        return label + ' : ' + value.toLocaleString() + ' %'
                    }
                }
            },
            datalabels: {
                formatter: function (value) {
                    return value.toLocaleString() + ' %'
                },
                anchor: 'middle',
                align: 'middle',
                display: 'auto',
                font: {
                    size: '10'
                }
            }
        }
    }

    const chartBubble = {
        scales: {
            x: {
                title: {
                    display: true,
                    text: optFromChartConf.data.label[0]
                }
            },
            y: {
                title: {
                    display: true,
                    text: optFromChartConf.data.label[1]
                }
            }
        },
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return optFromChartConf.data.label[0] + ' : ' + context.raw.x + ', ' + optFromChartConf.data.label[1] + ' : ' + context.raw.y
                    },
                    title: function (context) {
                        return context[0].label
                    }
                }
            }
        }
    }

    return { chartClassicBar, chartClassicBarPercent, chartLine, chartLinePercent, chartStackedSum, chartStackedPercent100, chartStackedPercent, chartPyramide, chartHorizontal, chartClassicDoughnut, chartDoughnutPercent, chartBubble }
}

export { chartOpts }