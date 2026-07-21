import React from 'react'
import PropTypes from 'prop-types'
import {Switch, Router, Route, Redirect} from 'react-router'
import {DynamicModule} from '@stellar-expert/ui-framework'

import NotFoundView from './pages/not-found-page-view'
import IntroPageView from './intro/intro-page-view'
import LayoutView from './pages/layout-view'
import DaoRouter from './dao/dao-router'
import AllFeedsView, {AllBeamFeedsView, AllPulseFeedsView} from './live/all-feeds-view'
import OracleFeedView from './live/oracle-feed-view'

export default function AppRouter({history}) {
    return <Router history={history}>
        <LayoutView>
            <Switch>
                {/*<Route path="/" exact component={Home}/>*/}
                {/*tools*/}
                <Route path="/" exact component={IntroPageView}/>
                <Route path="/oracles/:network/:address" component={OracleFeedView}/>
                <Route path="/pulse" component={AllPulseFeedsView}/>
                <Route path="/beam" component={AllBeamFeedsView}/>
                <Route path="/docs">
                    <DynamicModule module="docs" load={() => import(/* webpackChunkName: "docs" */ './docs/docs-view')}/>
                </Route>
                <Route path="/flare">
                    <DynamicModule module="subscription" load={() => import(/* webpackChunkName: "subscription" */ './subscriptions/subscriptions-router')}/>
                </Route>
                <Route path="/dao" component={DaoRouter}/>
                <Redirect from="/oracles" to="/pulse"/>
                <Redirect from="/subscription/add" to="/flare/add" exact/>
                <Redirect from="/subscription" to="/flare"/>
                {/*not found*/}
                <Route component={NotFoundView}/>
            </Switch>
        </LayoutView>
    </Router>
}

//<Route path="/terms" component={loadable(() =>
//   import(/* webpackChunkName: "legal" */ './terms/legal-router'))}/>
/*<Route path="/info">
    <Loadable moduleKey="info" load={() => import(/!* webpackChunkName: "info" *!/ './info/info-router')}/></Route>*/

AppRouter.propTypes = {
    history: PropTypes.object.isRequired
}
