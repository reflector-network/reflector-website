import {Route, RouterSwitch} from '@stellar-expert/ui-framework'
import React from 'react'
import SubscriptionsView from './subscriptions-view'
import CreateSubscriptionView from './create-subscription-view'
import SubscriptionsLayout from './subscriptions-layout'


export default function SubscriptionRouter() {
    return <SubscriptionsLayout>
        <RouterSwitch>
            <Route path="/flare/add" component={CreateSubscriptionView}/>
            <Route path="/flare/" component={SubscriptionsView}/>
        </RouterSwitch>
    </SubscriptionsLayout>
}