import React, {useCallback, useEffect, useRef, useState} from 'react'
import {useLocation} from '@stellar-expert/ui-framework'
import cn from 'classnames'
import './layout.scss'

const headerStaticPosition = 50
let scrolledValue = 50

export default function LayoutView({children}) {
    const [isFixed, setIsFixed] = useState(window.scrollY)
    const [isVisible, setIsVisible] = useState(true)
    const header = useRef()

    const stickyNavigation = useCallback(() => {
        setIsFixed(window.scrollY >= headerStaticPosition)
        setIsVisible(scrolledValue >= window.scrollY)
        scrolledValue = window.scrollY
    }, [])

    useEffect(() => {
        stickyNavigation()
        window.addEventListener('scroll', stickyNavigation)

        return () => window.removeEventListener('scroll', stickyNavigation)
    }, [stickyNavigation])

    return <>
        <header ref={header} className={`header ${isFixed ? 'fixed' : ''} ${!isVisible ? 'hidden' : ''}`}>
            <div className="container">
                <a href="/" className="logo">
                    <img src="/images/logo-white.svg" alt="Reflector"/>
                    <span>Reflector</span>
                </a>
                <MainMenu/>
            </div>
        </header>
        <div style={{minHeight: '90vh'}}>
            {children}
        </div>
        <footer className="footer">
            <div className="container text-center">
                <a href="https://github.com/reflector-network"><i className="icon-github"/>Source Code</a>&emsp;
                <div className="mobile-only"/>
                <a href="https://discord.gg/v2ggfDty2d"><i className="icon-discord"/> Discord Community</a>&emsp;
                <div className="mobile-only"/>
                <a href="mailto:info@stellar.expert"><i className="icon-email"/>Email Support</a>
                <div className="text-small dimmed">
                    {new Date().getFullYear()} © REFLECTOR
                </div>
            </div>
        </footer>
    </>
}

const mainMenuItems = [
    ['About', '/'],
    ['Pulse', '/pulse'],
    /*['Beam', '/beam'],*/
    ['Flare', '/flare'],
    ['Docs', '/docs'],
    ['DAO', '/dao/blueprint']
]

function MainMenu() {
    const [menuVisible, setMenuVisible] = useState(false)
    const {pathname} = useLocation()
    const hideMenu = useCallback(() => {
        setTimeout(() => setMenuVisible(false), 100)
    }, [setMenuVisible])
    useEffect(() => {
        window.addEventListener('scroll', hideMenu)
        return () => {
            window.removeEventListener('scroll', hideMenu)
        }
    }, [hideMenu])
    const isActive = useCallback(href => {
        return href === '/' ?
            pathname === href :
            pathname.startsWith(href)
    }, [pathname])
    return <div className="main-menu" onScroll={hideMenu}>
        <a className="toggle-menu" href="#" onClick={e => setMenuVisible(!menuVisible)}>
            <i className="icon icon-menu"/>
        </a>
        <div className={cn('nav-menu-dropdown', {active: menuVisible})} onClick={hideMenu}>
            {mainMenuItems.map(([title, href]) =>
                <a key={href} href={href} className={cn('menu-item', {inactive: isActive(href)})} onClick={hideMenu}>/ {title}</a>)}
        </div>
    </div>
}