import React, {useEffect, useState} from 'react'
import {useParams} from 'react-router'
import {AccountAddress, UtcTimestamp} from '@stellar-expert/ui-framework'
import InfoLayoutView from '../pages/info-layout-view'
import {invokeDaoFunction} from './dao-client'
import {DaoBallotVotingInfoView} from './dao-ballot-voting-info-view'
import {ballotCategories, ballotStatuses} from './dao-ballot-categories'

export default function DaoBallotView() {
    const {ballotId} = useParams()
    const [ballot, setBallot] = useState()
    useEffect(() => {
        invokeDaoFunction((client, address) => client.fetchBallot(BigInt(ballotId)), true)
            .then(setBallot)
            .catch(e => {
                console.error(e)
                notify({type: 'error', message: 'Failed to load DAO proposal #' + ballotId})
            })
    }, [ballotId])
    if (!ballot)
        return <div className="loader"/>

    return <InfoLayoutView info={<DaoBallotVotingInfoView/>}>
        <h2>/ DAO Proposal #{ballotId} "{ballot.title}"</h2>
        <div className="row">
            <div className="column column-50 space">
                <span className="dimmed">Category: </span>
                {ballotCategories[ballot.category]}
            </div>
            <div className="column column-50 desktop-right space">
                <span className="dimmed">Status: </span>
                {ballotStatuses[ballot.status]}
            </div>
            <div className="column column-50 space">
                <span className="dimmed">Initiator: </span>
                <AccountAddress account={ballot.initiator}/>
            </div>
            <div className="column column-50 desktop-right space">
                <span className="dimmed">Created: </span>
                <UtcTimestamp date={Number(ballot.created)}/>
            </div>
        </div>
        <div className="space">
            <div className="dimmed">Description</div>
            <div className="micro-space">
                {ballot.description}
            </div>
        </div>
    </InfoLayoutView>
}