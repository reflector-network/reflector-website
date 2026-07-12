import React from 'react'
import {usePageMetadata} from '@stellar-expert/ui-framework'
import {Route, Switch} from 'react-router'
import NotFoundView from '../pages/not-found-page-view'
import PageLayoutView from '../pages/page-layout-view'
import DocsNavPanelView from './docs-nav-panel-view'
import UsageExamplesView from './usage-examples-view'
import ContractInterfaceView from './contract-interface-view'
import GettingStartedView from './getting-started-view'
import HowItWorksView from './how-it-works-view'
import {examples} from './examples'
import './docs.scss'

const docsRoot = '/docs'

const docsNavLinks = [
    {title: 'Getting started', link: docsRoot},
    {title: 'How it works', link: docsRoot + '/how-it-works'},
    {title: 'Use public feed', link: docsRoot + '/interface'},
    {
        title: 'Examples',
        link: docsRoot + '/examples',
        links: Object.entries(examples).map(([key, props]) => ({title: props.title, link: docsRoot + '/examples/' + key}))
    }
]

export default function DocsView() {
    usePageMetadata({
        title: 'Documentation',
        description: 'Documentation and usage examples of Reflector oracle contracts'
    })
    return <PageLayoutView className="docs" style={{fontSize: '1.1em'}}>
        <div className="row">
            <div className="column column-33">
                <DocsNavPanelView links={docsNavLinks}/>
                <hr className="flare mobile-only"/>
            </div>
            <div className="column column-66">
                <div className="segment">
                    <Switch>
                        <Route path={`${docsRoot}`} exact component={GettingStartedView}/>
                        <Route path={`${docsRoot}/how-it-works`} component={HowItWorksView}/>
                        <Route path={`${docsRoot}/examples`} component={UsageExamplesView}/>
                        <Route path={`${docsRoot}/interface`} component={ContractInterfaceView}/>
                        <Route component={NotFoundView}/>
                    </Switch>
                </div>
            </div>
        </div>
    </PageLayoutView>
}