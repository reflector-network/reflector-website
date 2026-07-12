import React, {memo, useCallback, useRef} from 'react'
import integrations from './integrations.json'
import './integrations.scss'

export default memo(function IntegrationsSection() {
    const carousel = useRef()
    const scroll = useCallback(e => {
        e.preventDefault()
        let direction = -1
        if (e.target.classList.contains('right')) {
            direction = 1
        }
        const viewport = carousel.current
        const prev = viewport.scrollLeft
        viewport.scrollBy({left: direction * 100, top: 0, behavior: 'smooth'})
        setTimeout(() => {
            if (prev === viewport.scrollLeft) {
                viewport.scrollTo({left: direction === 1 ? 0 : viewport.scrollWidth - viewport.clientWidth, top: 0, behavior: 'smooth'})
            }
        }, 200)
    }, [carousel])
    return <section className="integrations">
        <div className="section-bg" style={{backgroundImage: 'radial-gradient(circle at 30%,var(--color-primary),transparent)'}}/>
        <div className="row">
            <div className="column column-center">
                <div className="container relative">
                    <h2 className="text-center hero-text mobile-only" style={{margin: '0.4em 0'}}>INTEGRATIONS</h2>
                    <div className="carousel" ref={carousel}>
                        <Integrations/>
                    </div>
                    <a href="#" className="left icon-arrow-left-circle" onClick={scroll}/>
                    <a href="#" className="right icon-arrow-right-circle" onClick={scroll}/>
                    <h2 className="text-right hero-text desktop-only">INTEGRATIONS</h2>
                    <div className="hero-description text-right desktop-only">protocols that already utilize our price feeds</div>
                </div>
            </div>
        </div>
    </section>
})

function Integrations({className}) {
    return <>
        {integrations.map(integration => <Integration key={integration.title} integration={integration} className={className}/>)}
        <Integration integration={null} className={className}/>
    </>
}

function Integration({integration}) {
    if (!integration)
        return <div>
            <div className="space mobile-only"/>
            <div className="segment integration">
                <h2>Your DeFi app</h2>
                <div className="text-small space">&nbsp;</div>
                <div className="text-small">&nbsp;</div>
                <div className="space"/>
                <p>
                    Decided to integrate Reflector price feeds into your DeFi protocol?
                </p>
                <p>
                    Start with reading <a href="/docs/how-it-works">how it works</a> and check
                    code <a href="/docs/examples">integration examples</a>.
                </p>
                <p>
                    Join <a href="https://discord.gg/uy5UXg3t6F">Reflector Discord community</a> — the best place to follow
                    project updates, directly chat with the project team, and connect with other ecosystem developers.
                </p>
            </div>
        </div>
    return <div>
        <div className="space mobile-only"/>
        <div className="segment integration">
            <h2><a href={integration.url} target="_blank">{integration.title}</a></h2>
            <img className="integration-bg" src={`/vendors/${integration.icon}`} alt={integration.title}/>
            <div className="text-small dimmed space">Category: {integration.category}</div>
            <div className="text-small"><a href={integration.url} target="_blank">{integration.url}</a></div>
            <div className="space"/>
            {integration.description.split('\n').map(desc => <p key={desc}>{desc}</p>)}
        </div>
    </div>
}