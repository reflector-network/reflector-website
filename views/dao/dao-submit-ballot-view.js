import React, {memo, useCallback, useState} from 'react'
import {StrKey} from '@stellar/stellar-sdk'
import {Amount, Button, Dropdown, InfoTooltip} from '@stellar-expert/ui-framework'
import {navigation} from '@stellar-expert/navigation'
import {shortenString} from '@stellar-expert/formatter'
import InfoLayoutView from '../pages/info-layout-view'
import {invokeDaoFunction} from './dao-client'
import {DaoBallotVotingInfoView} from './dao-ballot-voting-info-view'
import {ballotCategoryOptions} from './dao-ballot-categories'

export default function DaoSubmitBallotView() {
    const [category, setCategory] = useState(2)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [inProgress, setInProgress] = useState(false)

    const updateTitle = useCallback(e => setTitle(e.target.value), [setTitle])
    const updateDescription = useCallback(e => setDescription(e.target.value), [setDescription])

    const submit = useCallback(() => {
        if (!title || !description)
            return notify({type: 'warning', message: 'Please fill in all fields'})
        if (title.length < 10)
            return notify({type: 'warning', message: 'Please provide more descriptive title'})
        if (description.length < 10)
            return notify({type: 'warning', message: 'Please provide more detailed description'})
        setInProgress(true)
        invokeDaoFunction((client, address) => client.createBallot({
            title,
            description,
            initiator: address,
            category
        }))
            .then(res => {
                notify({type: 'success', message: 'DAO proposal created'})
                navigation.navigate(`/dao/proposal/${res}`)
            })
            .catch(e => {
                console.error(e)
                notify({type: 'error', message: 'Failed to create new DAO proposal'})
            })
            .finally(() => {
                setInProgress(false)
            })
    }, [category, title, description])

    return <InfoLayoutView info={<DaoBallotVotingInfoView/>}>
        <h2>/ Submit DAO governance proposal</h2>
        <div className="space">
            <div className="row">
                <div className="column column-66">
                    <label>Proposal category:{' '}
                        <Dropdown options={ballotCategoryOptions} value={category}
                                  onChange={cat => setCategory(cat.value === undefined ? cat : cat.value)}/>
                    </label>
                </div>
                <div className="column column-33 desktop-right">
                    Deposit: <Amount amount={ballotCategoryPrice[category]}
                                     asset="XRF-GCHI6I3X62ND5XUMWINNNKXS2HPYZWKFQBZZYBSMHJ4MIP2XJXSZTXRF"
                                     issuer={false}/>
                </div>
            </div>
            <div className="space"/>
            {category === 2 && <AssetBallot onChange={setTitle}/>}
            {category === 1 && <PriceFeedBallot onChange={updateTitle}/>}
            {category === 0 && <NodeBallot onChange={setTitle}/>}
            {category === 3 && <GeneralBallot onChange={updateTitle}/>}
            <div>
                <label>Description<br/>
                    <textarea onChange={updateDescription} value={description} maxLength={160}
                              placeholder="Provide additional context for the proposal"/>
                </label>
            </div>
        </div>

        <div className="space row">
            <div className="column column-25 column-offset-50">
                <Button block onClick={submit} disabled={inProgress} loading={inProgress}>Create</Button>
            </div>
            <div className="column column-25">
                <Button block outline href="/dao/blueprint">Cancel</Button>
            </div>
        </div>
    </InfoLayoutView>
}

function AssetBallot({onChange}) {
    const [assetCode, setAssetCode] = useState('')
    const [source, setSource] = useState('')
    const updateAsset = (code, source) => {
        let asset = 'Add ' + code
        if (StrKey.isValidEd25519PublicKey(source.trim())) {
            asset += '-' + shortenString(source, 16)
        } else {
            asset += source.substring(0, 22)
        }
        onChange(asset)
    }
    const updateAssetCode = e => {
        const code = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)
        setAssetCode(code)
        updateAsset(code, source)
    }
    const updateAssetSource = e => {
        const src = e.target.value
        setSource(src)
        updateAsset(assetCode, src)
    }
    return <div className="row">
        <div className="column column-25">
            <label>Symbol <InfoTooltip>
                Symbol to quote (currency code for foreign exchange feeds, asset code for Stellar assets, or token name
                for external tokens)
            </InfoTooltip><br/>
                <input onChange={updateAssetCode} value={assetCode} maxLength={12}/>
            </label>
        </div>
        <div className="column column-75">
            <label>Source <InfoTooltip>
                Symbol to quote (asset issuer address for Stellar assets, currency description, or external data source)
            </InfoTooltip><br/>
                <input onChange={updateAssetSource} value={source} maxLength={56}/>
            </label>
        </div>
    </div>
}

function PriceFeedBallot({onChange}) {
    return <>
        <div>
            <label>
                Price feed source<br/>
                <input type="text" maxLength="40" onChange={onChange}
                       placeholder="e.g. Based on FX rates Sitzerland CB..."/>
            </label>
        </div>
    </>
}

function NodeBallot({onChange}) {
    const update = useCallback(e => onChange('Organization ' + e.target.value), [onChange])
    return <>
        <div>
            <label>
                Organization name<br/>
                <input type="text" maxLength="26" onChange={update}
                       placeholder="Title of the organization you want to add"/>
            </label>
        </div>
    </>
}

function GeneralBallot({onChange}) {
    return <>
        <div>
            <label>
                Short title<br/>
                <input type="text" maxLength="40" onChange={onChange} placeholder="Any relevant details/links"/>
            </label>
        </div>
    </>
}

const ballotCategoryPrice = {
    0: '50000',
    1: '100000',
    2: '5000',
    3: '10000'
}