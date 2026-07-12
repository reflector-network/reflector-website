import React from 'react'
import LivePriceUpdates from '../live/live-price-updates'
import './description-section.scss'

export default function DescriptionSection() {
    return <section className="screen-type-2 container">
        <div className="section-bg" style={{backgroundImage: 'radial-gradient(circle at 70%,var(--color-primary),transparent)'}}/>
        <div className="row">
            <div className="column column-66 column-center highlights double-space">
                <h2 className="hero-text">Highlights</h2>
                <div className="hero-description">&nbsp;what's so special in our protocol</div>
                <div className="row">
                    <div className="item column column-50">
                        <div className="icon icon-nodes"/>
                        <div>Nodes curated by<br/>reputable organizations</div>
                    </div>
                    <hr className="flare mobile-only"/>
                    <div className="item column column-50">
                        <div className="icon icon-multisig"/>
                        <div>Multisig-protected<br/>secure consensus</div>
                    </div>
                    <hr className="flare mobile-only"/>
                    <div className="item column column-50">
                        <div className="icon icon-reliable"/>
                        <div>Reliable data source<br/>with regular updates</div>
                    </div>
                    <hr className="flare mobile-only"/>
                    <div className="item column column-50">
                        <div className="icon icon-comprehensive"/>
                        <div>Straightforward yet<br/>comprehensive interface</div>
                    </div>
                    <hr className="flare mobile-only"/>
                    <div className="item column column-50">
                        <div className="icon icon-cross"/>
                        <div>Cross-price, TWAP<br/>and other helpers</div>
                    </div>
                    <hr className="flare mobile-only"/>
                    <div className="item column column-50">
                        <div className="icon icon-free"/>
                        <div>Free of charge<br/>without limitations</div>
                    </div>
                </div>
            </div>
            <div className="column column-33 column-center">
                <div className="double-space segment">
                    <LivePriceUpdates/>
                </div>
                <div className="double-space"/>
            </div>
        </div>
    </section>
}