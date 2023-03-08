import{d as oe,B as ne,r as C,u as re,c as p,o as le,w as J,h as n,i as _,k as m,n as R,ag as X,q as i,p as l,j as o,L as Z,Q as se,ac as _e,m as V,t as k,N as ie,ae as ce,z as j,S as g,a as ve,_ as fe,g as pe,M as me,K as ge,F as he,C as Se,bl as ye,s as we}from"./index.8ea8b5e1.js";import{a as L,Q as Y}from"./QTr.f875d0ae.js";import{Q as ae}from"./QTable.d1b73e65.js";import{Q as be}from"./AffixSelector.ed8b6f1b.js";const ke={id:"Main"},xe={key:1,class:"HeaderFont"},Ce=o("br",null,null,-1),De=o("br",null,null,-1),$e=o("div",{class:"flex justify-center HeaderSize4"},[o("div",null,"There is no data for this request, yet...")],-1),Te=[Ce,De,$e],Ie={class:"flex justify-center"},Be={class:"flex justify-center"},Fe={class:"flex justify-center"},Ge={key:0},Ae={key:2},Pe=o("i",{class:"material-icons"},"warning",-1),ut=oe({__name:"SpecTableView",props:{dungeon:{type:Number}},setup(D){const B=D,{dungeon:v}=ne(B);let y=C([]),S=C(!1),G=C(!1),r=C(null),F=C({rowsPerPage:10,page:1,sortBy:"role",descending:!1});C({rowsPerPage:12,page:1,sortBy:"ascore",descending:!0});let E=C({rowsPerPage:99,page:1,sortBy:"ascore",descending:!0}),W=C([{name:"role",label:"",field:e=>e.field,align:"left"}]),K=C([{name:"name",label:"Name",field:e=>{var a,t;return`${(a=e.details)==null?void 0:a.name} ${(t=e.class)==null?void 0:t.name}`},sortable:!0,align:"left"},{name:"runs",label:"Amount of runs",field:e=>e.runs,sortable:!0,align:"center"},{name:"tscore",label:"Total Score",field:e=>e.tscore,sortable:!0,align:"center"},{name:"ascore",label:"Average score",field:e=>e.ascore,sortable:!0,align:"center"},{name:"intime_rate",label:"Success rate",field:e=>$(e.spec).ontime_percent||0,sortable:!0,align:"center"}]);const H=re(),w=H.state.data,z=p(()=>w.Spec_Data),x=p(()=>w.Specs),N=w.Classes,q=w.Spec_Dungeon_Data;w.Dungeons_Data;const M=p(()=>w.SelectedPeriode),A=w.settings,b=p(()=>{var e=["view","name","runs","tscore","ascore"];return v.value||e.push("intime_rate"),e});location.pathname.includes("/specs");const c=w,d=e=>H.dispatch("fetchSpecData",e),$=e=>{if(y.value)for(let a=0;a<y.value.length;a++){const t=y.value[a];if(t.id==e)return t}return!1},f=()=>{var e=g.groupBy([...z.value.data],"role");if(v.value){var a=[...q.filter(I=>I.dungeon===v.value&&M.value===I.periode&&I.created>c.Reloaded_Timestamp)];e=g.groupBy(g._sortBy(a,"created").reverse()[0].data,"role")}var t=[];for(var s in e)t.push({role:s,list:e[s],expand:!0});for(let I=0;I<t.length;I++){const Q=t[I];var T=[];for(var P in Q.list){var h={...Q.list[P]};h.tscore=h.score,h.truns=de(Q.list),h.ascore=U(h.tscore,"mean",O(Q.list),h.runs),h.pscore=U(h.tscore,"percent",O(Q.list),h.runs),T.push(h)}Q.list=T}r.value=t},u=()=>{S.value=!0;var e=w.apiUrl;ve.get(e+"/Spec/ontimerate?periode="+M.value+"&min_level="+A.min_keystonelevel+"&amount="+A.max_runs+"&limitToLowestDungeon="+A.limitbylowestdungeon).then(function(a){y.value=a.data,S.value=!1}).catch(function(a){console.log(a),a.value=!0,S.value=!1})},U=(e,a,t,s)=>g.GetPoints(e,a,t,s),O=e=>{var a=0;for(let t=0;t<e.length;t++)a+=e[t].score;return a},de=e=>{var a=0;for(let t=0;t<e.length;t++)a+=e[t].runs;return a},ue=(e,a)=>{for(let t=0;t<r.value.length;t++){const s=r.value[t];if(s.role.toLowerCase()===e.toLowerCase())if(a)for(let T=0;T<s.list.length;T++){const P=s.list[T];if(P.id==a)return P}else return s}},ee=e=>{if(N)for(let a=0;a<N.length;a++){const t=N[a];if(t.id==e)return t}},te=e=>{if(x.value)for(let a=0;a<x.value.length;a++){const t=x.value[a];if(t.id==e)return t}};return le(()=>{v.value?d({id:v.value}):M.value&&(z.value?f():d(),u())}),J(z,()=>{v.value||f()}),J(M,()=>{r.value=null,G.value=!1,u()}),J(q,()=>{f()}),(e,a)=>(n(),_("div",ke,[m(r)==null?(n(),R(X,{key:0,class:"absolute-center",style:{color:"rgb(161, 161, 161)"},size:"200"})):m(r).length==0?(n(),_("div",xe,Te)):m(r).length!=0?(n(),R(ae,{key:2,"rows-per-page-options":[],"card-class":"background HeaderFont","table-class":"HeaderFont","table-header-class":"HeaderFont",dark:"",flat:"",rows:m(r),columns:m(W),pagination:m(F),"hide-bottom":"","hide-header":"","row-key":"role"},{body:i(t=>[l(Y,{props:t},{default:i(()=>[l(L,{key:"role",props:t},{default:i(()=>[o("div",Ie,[o("div",Be,[l(Z,{url:`roles/${t.row.role.toLowerCase()}.png`},{default:i(({link:s})=>[l(se,{id:"roleImage","spinner-size":"15px","spinner-color":"white",src:s},null,8,["src"])]),_:2},1032,["url"])]),o("div",Fe,[l(_e,{dense:"",round:"",flat:"",icon:t.expand?"arrow_drop_down":"arrow_drop_up",onClick:s=>t.expand=!t.expand},null,8,["icon","onClick"])])])]),_:2},1032,["props"])]),_:2},1032,["props"]),t.expand?j("",!0):(n(),R(Y,{key:0,class:"hideHoverGlobal",props:t},{default:i(()=>[l(L,{colspan:"100%"},{default:i(()=>[l(ae,{"rows-per-page-options":[],"card-class":"background HeaderFont","table-class":"HeaderFont","table-header-class":"HeaderFont",dark:"",dense:"",flat:"",rows:t.row.list,columns:m(K),pagination:m(E),"hide-bottom":"","row-key":"spec","visible-columns":m(b)},{body:i(s=>[l(Y,{props:s},{default:i(()=>[l(L,{key:"name",props:s},{default:i(()=>{var T,P,h;return[o("div",{style:ie(`color: ${(T=ee(s.row.class_id))==null?void 0:T.color};`),class:"flex justify-start align-items-start gap-5"},[l(Z,{url:te(s.row.spec).icon_url},{default:i(({link:I})=>[l(se,{"spinner-size":"15px","spinner-color":"white",class:"tableIcon",src:I},null,8,["src"])]),_:2},1032,["url"]),V(" "+k(`${(P=te(s.row.spec))==null?void 0:P.name} ${(h=ee(s.row.class_id))==null?void 0:h.name}`),1)],4)]}),_:2},1032,["props"]),l(L,{key:"runs",props:s},{default:i(()=>[V(k(s.row.runs)+" ("+k(Math.round(s.row.runs/s.row.truns*1e4)/100)+"%)",1)]),_:2},1032,["props"]),l(L,{key:"tscore",props:s},{default:i(()=>[V(k(Math.round(s.row.score))+" ("+k(U(s.row.score,"percent",O(ue(s.row.role).list),s.row.runs))+"%)",1)]),_:2},1032,["props"]),l(L,{key:"ascore",props:s},{default:i(()=>[V(k(U(s.row.score,"mean",0,s.row.runs)),1)]),_:2},1032,["props"]),l(L,{key:"intime_rate",props:s},{default:i(()=>[$(s.row.spec)?(n(),_("div",Ge,k(Math.round($(s.row.spec).ontime_percent*10)/10)+"%",1)):m(S)?(n(),R(X,{key:1,size:"15"})):(n(),_("div",Ae,[Pe,l(ce,null,{default:i(()=>[V("Success rate is generated separately. Could not get the data")]),_:1})]))]),_:2},1032,["props"])]),_:2},1032,["props"])]),_:2},1032,["rows","columns","pagination","visible-columns"])]),_:2},1024)]),_:2},1032,["props"]))]),_:1},8,["rows","columns","pagination"])):(n(),R(X,{key:3,class:"absolute-center",style:{color:"rgb(161, 161, 161)"},size:"200"}))]))}});const Le={components:{CloudinaryFormat:Z},props:["SpecItem","ClassItem"],data(){return{}},methods:{GetPoints(D){var B=String(D/1e3).substring(0,4);return B.includes(".")&&(B=String(D/1e3).substring(0,5)),B},isEven(D){return D%2==0}},computed:{Settings(){return this.$store.state.data.settings},TopBack(){return this.SpecItem.class.name.toLowerCase()=="rouge"||this.SpecItem.class.name.toLowerCase()=="priest"||this.SpecItem.class.name.toLowerCase()=="hunter"||this.SpecItem.class.name.toLowerCase()=="warrior"||this.SpecItem.class.name.toLowerCase()=="paladin"?!0:this.SpecItem.class.name.toLowerCase()=="mage"}}},He={class:"SpecViewWindowMAIN"},Me={class:"DarkerGreyOverlay"},Qe={class:"absolute-center"},Re={class:"flex flex-center"},Ve={class:"SpecTextCover"},ze={class:"absolute-left"},Ne={class:"Ccenter",style:{"margin-left":"27px"}},je={class:"flex flex-center rankBoxSpec"},Ee={class:"absolute-right"},We={class:"Ccenter",style:{"margin-right":"25px"}},qe={id:"points",class:"flex SpecTextCover flex-center"},Ue={class:"flex"},Ke={key:0};function Oe(D,B,v,y,S,G){const r=pe("CloudinaryFormat");return n(),_("div",He,[l(r,{url:`classes/${v.SpecItem.class.name.replace(" ","-")}.jpg`},{default:i(({link:F})=>[o("div",{class:me(["SpecViewWindow SpecMaxWidth absolute-center",{TopBack:G.TopBack}]),style:ie({"background-image":`url(${F})`})},[o("div",Me,[o("div",Qe,[o("div",Re,[o("div",Ve,k(v.SpecItem.details.name+" "+v.SpecItem.class.name),1)])]),o("div",ze,[o("div",Ne,[o("div",je,[o("div",null,k(v.SpecItem.rank),1)])])]),o("div",Ee,[o("div",We,[o("div",qe,[o("div",Ue,[o("div",null,k(v.SpecItem.display_score),1),G.Settings.score_type==="percent"?(n(),_("div",Ke,"%")):j("",!0)]),l(ce,null,{default:i(()=>[V(" Runs: "+k(v.SpecItem.runs),1)]),_:1})])])])])],6)]),_:1},8,["url"])])}var Je=fe(Le,[["render",Oe]]);const Xe={key:0,class:"flex flex-center"},Ye={key:1},Ze={key:0,class:"HeaderFont nodataInfo"},et=o("h4",{class:"flex flex-center"},"No data found!",-1),tt=o("p",{class:"flex flex-center"},"Try to change the settings up in the right",-1),st=[et,tt],at={key:1},ot=ye('<br><div class="flex flex-center"><div style="width:100%;" class="SpecMaxWidth HeaderFont relative-position"><div class="absolute-left" style="margin-left:25px;"><div>Rank</div></div><div class="absolute-right" style="margin-right:25px;"><div>Score</div></div><div class="absolute-center"><div>Name</div></div></div></div><br><br>',4),nt={class:"flex justify-around HeaderFont"},rt={class:"flex flex-center"},_t=oe({__name:"SpecList",props:{Selected:{},dungeon:{}},setup(D){const B=D,{Selected:v,dungeon:y}=ne(B),S=C(!1),G=re(),r=G.state.data,F=p(()=>r.Spec_Data),E=p(()=>r.Specs),W=p(()=>r.Classes),K=p(()=>r.Spec_Dungeon_Data);p(()=>r.Dungeons_Data);const H=p(()=>r.SelectedPeriode),w=p(()=>r.settings),z=p(()=>r.Reloaded_Timestamp),x=p(()=>{var d,$,f;var b=[...($=(d=F.value)==null?void 0:d.data)!=null?$:[]].map(u=>({...u}));if(y.value){var c=g._sortBy([...(f=K.value)!=null?f:[]].map(u=>({...u})).filter(u=>u.dungeon===y.value&&H.value===u.periode&&u.created>z.value),"created").reverse()[0];if(c)return g.AddClassToSpecs(c.data,W.value),g.AddSpecDetailsToSpec(c.data,E.value),c}else if(!y.value)return F.value&&F.value.data&&(g.AddClassToSpecs(b,W.value),g.AddSpecDetailsToSpec(b,E.value)),{...F.value,data:b}}),N=ge(),q=p(()=>N.currentRoute.value.path.includes("/specs")),M=b=>G.dispatch("fetchSpecData",b),A=b=>{if(x.value){var c=we.toArray(g.groupBy(x.value.data,"role")[b]),d=g.groupBy(x.value.data,"role")[b],$=0;if(d)for(let f=0;f<d.length;f++)$+=d[f].score;for(let f=0;f<c.length;f++){const u=c[f];u.display_score=g.GetPoints(u.score,w.value.score_type,$,u.runs)}return g.getListWithRank(g._sortBy(c,"display_score"))}};return le(()=>{q.value&&(S.value=!0),y.value&&!x.value&&M({id:y.value})}),(b,c)=>(n(),_("div",null,[m(H)&&m(x)&&m(H)!=m(x).periode||!A("DAMAGE")?(n(),_("div",Xe,[l(be,{style:{color:"rgb(161, 161, 161)"},size:"500"})])):(n(),_("div",Ye,[A("DAMAGE").length===0?(n(),_("div",Ze,st)):(n(),_("div",at,[ot,o("div",nt,[(n(!0),_(he,null,Se(A("DAMAGE"),d=>(n(),_("div",{style:{width:"100%"},key:d.id},[d.rank<11||S.value?(n(),R(Je,{key:0,SpecItem:d},null,8,["SpecItem"])):j("",!0)]))),128))]),o("div",rt,[S.value?j("",!0):(n(),_("div",{key:0,onClick:c[0]||(c[0]=d=>S.value=!0),id:"SpecShowerShowAllbtn",class:"HeaderFont"},"Show all")),S.value?(n(),_("div",{key:1,onClick:c[1]||(c[1]=d=>S.value=!1),id:"SpecShowerShowAllbtn",class:"HeaderFont"},"Show less")):j("",!0)])]))]))]))}});export{ut as _,_t as a};
