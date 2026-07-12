import React from 'react'
import './promo-section.scss'

export default function PromoSection() {
    return <section className="screen-type-1">
        <div className="section-bg" style={{backgroundImage: 'url(images/bg-triangles.jpg)', top: '-8vh', bottom: '-5vh'}}/>
        <div className="container">
            <div className="group animate__animated animate__fadeInUp">
                <div className="row">
                    <div className="column column-50">
                        <div className="vertical-distribution">
                            <div className="container desktop-only">
                                <h3 style={{margin: '1em 0 0 1.6em'}}>Ultimate price reference for Stellar DeFi</h3>
                            </div>
                            <div className="container mobile-only">
                                <h3 className="text-center space">Ultimate price reference for Stellar DeFi</h3>
                            </div>
                            <div className="double-space mobile-only"/>
                            <div className="double-space mobile-only"/>
                            <h1 className="sub-hero-text mobile-center">
                                Perfect fit for
                                <div className="case-scroller">
                                    <div>algorithmic stablecoins</div>
                                    <div>lending/borrowing</div>
                                    <div>financial derivatives</div>
                                    <div>asset management</div>
                                    <div>insurance</div>
                                    <div>algorithmic stablecoins</div>
                                </div>
                            </h1>
                            <div className="double-space mobile-only"/>
                        </div>
                    </div>
                    <div className="double-space mobile-only"/>
                    <div className="column column-50 text-center">
                        <img src="/images/org-cluster.svg" style={{padding: '3em 0', height: '85vmin'}}
                             alt="Reflector cluster - StellarExpert, UltraStellar, Script3, PublicNode, xyclooLabs, Lightsail, CreitTech"/>
                    </div>
                </div>
            </div>
        </div>
    </section>
}