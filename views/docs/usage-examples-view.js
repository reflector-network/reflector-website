import React from 'react'
import {CodeBlock, usePageMetadata, useLocation} from '@stellar-expert/ui-framework'
import {examples} from './examples'

export default function UsageExamplesView() {
    const {pathname} = useLocation()
    const key = pathname.split('/').pop()
    const example = examples[key]
    if (!example) {
        return <div>
            <h1 className="desktop-right" style={{marginBottom:0}}>/ Examples</h1>
            <div className="dimmed text-small desktop-right">Practical examples of Reflector contracts invocation</div>
            <div className="space">
                {Object.entries(examples).map(([key, {title, description}], i) => <div key={key} className="space">
                    {i > 0 && <hr className="flare space"/>}
                    <h3><a href={`examples/${key}`}><i className="icon-puzzle"/> {title}</a></h3>
                    <div>{description}</div>
                </div>)}
            </div>
        </div>
    }
    const {title, description, code, extraInfo} = example
    usePageMetadata({title: title + ' / Documentation', description: `${title} usage example with Reflector oracle`})
    return <div>
        <h1 className="text-right">/ Examples - {title}</h1>
        <hr className="flare space"/>
        <div className="space">{description}</div>
        {(extraInfo || '').split('\n').map((v, i) => <div key={i + title} className="space">{v}</div>)}
        <CodeBlock lang="rust">{code}</CodeBlock>
    </div>
}