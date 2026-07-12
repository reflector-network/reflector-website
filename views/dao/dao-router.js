import {Redirect, Route, Switch} from 'react-router'
import React from 'react'
import PageLayoutView from '../pages/page-layout-view'
import DaoBlueprintView from './dao-blueprint-view'
import DaoSubmitBallotView from './dao-submit-ballot-view'
import DaoBallotView from './dao-ballot-view'

export default function SubscriptionRouter() {
    return <PageLayoutView>
        <Switch>
            <Route path="/dao/blueprint" component={DaoBlueprintView}/>
            <Route path="/dao/submit-proposal" component={DaoSubmitBallotView}/>
            <Route path="/dao/proposal/:ballotId" component={DaoBallotView}/>
            <Redirect from="/dao" to="/dao/blueprint" exact/>
        </Switch>
    </PageLayoutView>
}