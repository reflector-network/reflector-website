import React from 'react'
import {usePageMetadata} from '@stellar-expert/ui-framework'
import DescriptionSection from './description-section'
import PromoSection from './promo-section'
import ApproachSection from './approach-section'
import IntegrationsSection from './integrations-section'

export default function IntroPageView() {
    usePageMetadata({
        title: '',
        description: ''
    })
    return <>
        <PromoSection/>
        <DescriptionSection/>
        <ApproachSection/>
        <IntegrationsSection/>
        {/*<section className="screen-type-3">
            <div className="container wrap-center">
                <h2 className="title">Why oracles so important</h2>
                <div className="flex-between">
                    <div className="preview flex-center">
                        <img className="animate__animated animate__zoomIn" src="images/logo-white.svg"/>
                    </div>
                    <div className="group">
                        <p className="animate__animated animate__fadeInRight">
                            Oracle manipulation is one of the most common vector attacks on DeFi contracts.
                            <br/><br/>
                            People continue to lose millions of dollars yearly because of price quotation exploits.
                            <br/><br/>
                            Choose price feed for your project wisely!
                        </p>
                    </div>
                </div>
            </div>
        </section>*/}
    </>
}