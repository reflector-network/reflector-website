import React from 'react'
import {render} from 'react-dom'
import {createToastNotificationsContainer, initMeta, bindClickNavHandler} from '@stellar-expert/ui-framework'
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

//attach before rendering - components that look themselves up by id on mount (charts) find nothing in a detached tree
document.body.appendChild(appContainer)
render(<Router/>, appContainer)
const preLoader = document.getElementById('pre-loader')
preLoader.parentNode.removeChild(preLoader)
createToastNotificationsContainer()