import React from 'react'
import cn from 'classnames'

export default function PageLayoutView({children, className, style = {}, maxWidth = '1400px'}) {
    return <div className={cn('container', className)} style={{paddingTop: '3em', maxWidth, ...style}}>
        <div className="double-space desktop-only"/>
        <div className="space mobile-only"/>
        {children}
    </div>
}