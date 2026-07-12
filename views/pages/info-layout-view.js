import React from 'react'

export default function InfoLayoutView({children, info, style = {}}) {
    return <div className="container" style={{maxWidth: '1400px',...style}}>
        <div className="row">
            <div className="column column-67">
                <div className="segment">{children}</div>
            </div>
            <div className="space mobile-only"/>
            <div className="column column-33">
                <div className="segment">
                    <div className="double-space"></div>
                    {info}
                </div>
            </div>
        </div>
    </div>
}