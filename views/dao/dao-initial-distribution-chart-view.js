import React from 'react'
import {Chart} from '@stellar-expert/ui-framework'

export default function DaoInitialDistributionChartView() {
    const options = {
        chart: {
            type: 'variablepie'
        },
        series: [{
            minPointSize: 20,
            innerSize: '40%',
            zMin: 0,
            name: 'XRF',
            showInLegend: true, //pie legend is opt-in in the charting engine, unlike the Highcharts default
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
