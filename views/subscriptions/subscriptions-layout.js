import React from 'react'

export default function SubscriptionsLayout({children}) {
    return <div className="container" style={{paddingTop: '6em', maxWidth: '1400px'}}>
        <div className="row">
            <div className="column column-67">
                <div className="segment">{children}</div>
            </div>
            <div className="space mobile-only"/>
            <div className="column column-33">
                <div className="segment">
                    <div className="double-space"></div>
                    <p>
                        Reflector Subscriptions is a service for user-defined customized triggers invoked
                        automatically once the
                        price change for the specified asset reaches a certain threshold. Trigger conditions are evaluated by every
                        oracle node within the cluster independently on a regular basis with 1 minute polling interval,
                        and the corresponding action gets triggered only if the majority of nodes agree on the outcome.
                    </p>
                    <p>
                        Once the condition is met and the subscription is triggered, Reflector cluster publishes an on-chain proof of
                        the triggered event. At the same time, cluster nodes simultaneously push a notification
                        to the WebHook URL provided in the subscription.
                    </p>
                    <p>
                        This way, an application that created a subscription receives a notification from the oracle before it gets
                        published on the ledger, so it will have an option to react quickly and generate a transaction that will be
                        included into the same ledger as the proof itself.
                    </p>
                </div>
            </div>
        </div>
    </div>
}