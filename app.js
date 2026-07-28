import React from 'react'
import {render} from 'react-dom'
import {createToastNotificationsContainer, initMeta} from '@stellar-expert/ui-framework'
import {navigation, bindClickNavHandler} from '@stellar-expert/navigation'
import Router from './views/router'
import './styles.scss'

// In development use a same-origin path so the dev-server proxy (see webpack-config.js) fetches
// /explorer server-side, avoiding the cross-origin 403 from api.stellar.expert. Production is unchanged.
window.explorerApiOrigin = process.env.NODE_ENV === 'development' ? '' : 'https://api.stellar.expert'
const appContainer = document.createElement('div')

bindClickNavHandler(appContainer)

window.explorerFrontendOrigin = 'https://stellar.expert'

initMeta({
    serviceTitle: 'Reflector / Decentralized price oracle for Stellar Network',
    description: 'decentralized price oracle for Stellar Network'
})

render(<Router history={navigation.history}/>, appContainer)
const preLoader = document.getElementById('pre-loader')
preLoader.parentNode.removeChild(preLoader)
createToastNotificationsContainer()

document.body.appendChild(appContainer)