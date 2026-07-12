import React from 'react'
import './approach-section.scss'

export default function ApproachSection() {
    return <section>
        <div className="section-bg" style={{backgroundImage: 'url(images/bg-artwork.jpg)'}}/>
        <div className="row">
            <div className="column column-center">
                <div className="approach row highlights">
                    <div className="column">
                        <h2 className="text-center hero-text">DISTINCT APPROACH</h2>
                        <div className="hero-description text-center">better than oracles built with the widely utilized request-response model</div>
                        <div className="double-space mobile-only"/>
                    </div>
                    <div className="column column-40">
                        <div className="item top-left animate__animated animate__fadeInTopLeft">
                            IMMEDIATE DATA AVAILABILITY<br/>
                            FOR CONSUMER CONTRACTS
                            <hr className="flare mobile-only"/>
                        </div>
                        <div className="item bottom-left animate__animated animate__fadeInBottomLeft">
                            STRAIGHTFORWARD INVOCATION<br/>
                            OPTIMIZED FOR LOW FEES
                            <hr className="flare mobile-only"/>
                        </div>
                    </div>
                    <div className="column column-20 logo-center desktop-only">
                        <img src="/images/logo-white.svg"/>
                    </div>
                    <div className="column column-40">
                        <div className="item top-right animate__animated animate__fadeInTopRight">
                            EFFICIENT LEDGER<br/>
                            CAPACITY UTILIZATION
                            <hr className="flare mobile-only"/>
                        </div>
                        <div className="item bottom-right animate__animated animate__fadeInBottomRight">
                            UNIFORM PRICE<br/>
                            FEED TIMEFRAME
                            <hr className="flare mobile-only"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
}