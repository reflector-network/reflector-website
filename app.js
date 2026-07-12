import React from 'react'
import {render} from 'react-dom'
import {createToastNotificationsContainer, initMeta} from '@stellar-expert/ui-framework'
import {navigation, bindClickNavHandler} from '@stellar-expert/navigation'
import Router from './views/router'
import './styles.scss'

window.explorerApiOrigin = 'https://api.stellar.expert'
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