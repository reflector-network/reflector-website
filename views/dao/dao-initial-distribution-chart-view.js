import React from 'react'
import Chart from '../chart/chart'
import {formatWithAutoPrecision} from '@stellar-expert/formatter'

export default function DaoInitialDistributionChartView() {
    const options = {
        tooltip: {
            pointFormatter
        },
        chart: {
            type: 'variablepie'
        },
        series: [{
            minPointSize: 20,
            innerSize: '40%',
            zMin: 0,
            name: 'Share',
            borderRadius: 5,
            data: [
                {
                    name: 'Early protocol adopters',
                    y: 900000,
                    z: 120
                },
                {
                    name: 'Cluster node operators',
                    y: 4000000,
                    z: 100
                },
                {
                    name: 'Protocol developers',
                    y: 12600000,
                    z: 80
                },
                {
                    name: 'DAO fund smart contract',
                    y: 102500000,
                    z: 60
                }
            ]
        }]
    }
    return <div className="text-center">
        <Chart type="Chart" options={options} inline/>
    </div>
}

function pointFormatter() {
    return `<b>${formatWithAutoPrecision(this.y)}</b> XRF<br/>`
}