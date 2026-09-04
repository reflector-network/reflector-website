import {Redirect, Route, RouterSwitch} from '@stellar-expert/ui-framework'
import React from 'react'
import PageLayoutView from '../pages/page-layout-view'
import DaoBlueprintView from './dao-blueprint-view'
import DaoSubmitBallotView from './dao-submit-ballot-view'
import DaoBallotView from './dao-ballot-view'

export default function SubscriptionRouter() {
    return <PageLayoutView>
        <RouterSwitch>
            <Route path="/dao/blueprint" component={DaoBlueprintView}/>
            <Route path="/dao/submit-proposal" component={DaoSubmitBallotView}/>
            <Route path="/dao/proposal/:ballotId" component={DaoBallotView}/>
            <Redirect from="/dao" to="/dao/blueprint" exact/>
        </RouterSwitch>
    </PageLayoutView>
}