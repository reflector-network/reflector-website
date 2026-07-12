import React, {useCallback, useState} from 'react'
import {useLocation} from 'react-router'
import cn from 'classnames'
import './nav-panel.scss'

export default function DocsNavPanelView({links}) {
    return <div className="nav-panel segment">
        <div className="space sticky">
            {links.map(link => <NavLink key={link.title} link={link}/>)}
        </div>
    </div>
}

function NavLink({link: item, empty = false, level = 0}) {
    useLocation()
    const [_, refresh] = useState()
    const collapsible = item?.collapsed !== undefined
    const expand = useCallback(() => {
        if (collapsible) {
            item.collapsed = !item.collapsed
            refresh(new Date().getTime())
        }
    }, [item])
    const isSelected = location.pathname === item.link
    if (item.links) //group
        return <div className="nav-group">
            <a href={item.link || '#'} className={cn('nav-group-title', {
                collapsible,
                selected: isSelected
            })} onClick={expand}>{item.title}</a>
            {item.links.length > 0 ? <>
                    {!item.collapsed && <div style={{paddingLeft: (level + 1) + 'em'}}>
                        {item.links.map(link => <NavLink key={link.title} link={link} level={level + 1}/>)}
                    </div>}
                </> :
                <NavLink empty level={level + 1}/>}
        </div>
    return <a href={item.link} className={cn('nav-link', {selected: isSelected})}>{item.title}</a>
}