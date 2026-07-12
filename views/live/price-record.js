import React from 'react'

export function PriceRecordView({price, base}) {
    const [large, small] = price.split('.')
    return <span>
        {large}{!!small && <span style={{fontSize: '0.8em', opacity: 0.7}}>.{small}</span>}
    </span>
}