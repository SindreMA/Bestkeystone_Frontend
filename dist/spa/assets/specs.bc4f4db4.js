import{a as r}from"./AffixSelector.7df3a403.js";import{_ as i,a as d}from"./SpecList.dd9abfaf.js";import{d as u,u as _,e as m,c as s,S as p,h as a,i as f,j as e,p as h,n as l,F as S}from"./index.7dabd086.js";import"./QTr.17b52ebd.js";import"./QTable.ad356e36.js";import"./QMarkupTable.268de3e8.js";import"./QCheckbox.59fa3f0d.js";const x=e("div",null,[e("div",{class:"flex flex-center"},[e("div",{class:"Centertext HeaderSize HeaderFont"},` What's the "best" spec this week? `)]),e("div",{class:"flex flex-center"},[e("p",{class:"HeaderFont HeaderSize2"},"(ish)")])],-1),v=e("br",null,null,-1),b=e("br",null,null,-1),k=e("br",null,null,-1),F=e("br",null,null,-1),j=u({__name:"specs",setup(w){const t=_().state.data,n=m(),o=s(()=>p.GetDefaultView(n.screen.width,t.settings)),c=s(()=>t.Selected);return s(()=>t.SelectedAffixSet),s(()=>t.RIOData),s(()=>t.settings),(H,g)=>(a(),f(S,null,[e("div",null,[x,h(r),o.value==="table"?(a(),l(i,{key:0,selected:c.value},null,8,["selected"])):(a(),l(d,{key:1}))]),v,b,k,F],64))}});export{j as default};