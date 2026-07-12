import React, {memo} from 'react'

export const DaoBallotVotingInfoView = memo(function DaoBallotVotingInfoView() {
    return <>
        <p>
            When someone submits a DAO proposal, a certain amount of XRF tokens ("deposit") get transferred from the initiator account and
            locked in the contract. After that DAO members have 14 days to vote on this proposal.
        </p>
        <p>
            Any DAO decision requires a simple majority to agree on it. Once the ballot is concluded, all operators and Reflector developers
            team must comply with the outcome, commit to executing the DAO decision, and make all reasonable efforts to fulfill this
            obligation.
        </p>
        <p>
            In case of the positive voting decision, the whole XRF deposit amount gets burned which signifies the commitment of Reflector
            cluster operators to spend computational resources in the future to comply with the accepted DAO proposal.
        </p>
        <p>
            If the proposal is rejected, the initiator receives back 75% of the deposit, the remaining 25% of XRF tokens are burned.
        </p>
    </>
})