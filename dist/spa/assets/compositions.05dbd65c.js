import{C as c,a as n}from"./CompositionTableView.3396b33f.js";import{a as l}from"./AffixSelector.84cf2c84.js";import{d as p,u as d,e as m,c as f,S as u,h as s,i as S,p as _,n as o,j as e}from"./index.326ea565.js";import"./QTabPanels.addca843.js";import"./use-cache.b0833c75.js";import"./QInput.873a83cc.js";import"./QTr.e1e722a0.js";import"./QTable.dabdb8d3.js";import"./QMarkupTable.533909ff.js";import"./QCheckbox.231b7602.js";const x=e("div",null,[e("div",{class:"flex flex-center"},[e("div",{class:"Centertext HeaderSize HeaderFont"},` What's the "best" composition this week? `)]),e("div",{class:"flex flex-center"},[e("p",{class:"HeaderFont HeaderSize2"},"(ish)")])],-1),N=p({__name:"compositions",setup(h){const t=d().state.data;t.Selected,t.SelectedAffixSet;const a=t.settings,i=m(),r=f(()=>u.GetDefaultView(i.screen.width,a));return(k,w)=>(s(),S("div",null,[x,_(l),r.value==="table"?(s(),o(c,{key:0})):(s(),o(n,{key:1}))]))}});export{N as default};