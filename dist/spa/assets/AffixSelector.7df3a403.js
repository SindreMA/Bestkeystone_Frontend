import{H as o,D as p,bm as k,bn as w,L as g,bo as C,aA as b,y as G,_ as D,g as P,h as i,i as l,F as h,C as _,j as a,p as u,q as f,N as y,ae as A,l as F,t as d,z as v,bp as I}from"./index.7dabd086.js";const N=[o("g",{fill:"none","fill-rule":"evenodd","stroke-width":"2"},[o("circle",{cx:"22",cy:"22",r:"1"},[o("animate",{attributeName:"r",begin:"0s",dur:"1.8s",values:"1; 20",calcMode:"spline",keyTimes:"0; 1",keySplines:"0.165, 0.84, 0.44, 1",repeatCount:"indefinite"}),o("animate",{attributeName:"stroke-opacity",begin:"0s",dur:"1.8s",values:"1; 0",calcMode:"spline",keyTimes:"0; 1",keySplines:"0.3, 0.61, 0.355, 1",repeatCount:"indefinite"})]),o("circle",{cx:"22",cy:"22",r:"1"},[o("animate",{attributeName:"r",begin:"-0.9s",dur:"1.8s",values:"1; 20",calcMode:"spline",keyTimes:"0; 1",keySplines:"0.165, 0.84, 0.44, 1",repeatCount:"indefinite"}),o("animate",{attributeName:"stroke-opacity",begin:"-0.9s",dur:"1.8s",values:"1; 0",calcMode:"spline",keyTimes:"0; 1",keySplines:"0.3, 0.61, 0.355, 1",repeatCount:"indefinite"})])])];var B=p({name:"QSpinnerPuff",props:k,setup(e){const{cSize:r,classes:c}=w(e);return()=>o("svg",{class:c.value,stroke:"currentColor",width:r.value,height:r.value,viewBox:"0 0 44 44",xmlns:"http://www.w3.org/2000/svg"},N)}});const M={props:["hidePictures","localMode"],components:{CloudinaryFormat:g},data(){return{ShowSelectAffix:!1,dropdownSelectior:!1,localSelected:null}},watch:{},methods:{...C(["ChangeSelectedPeriode"]),ItemClicked(e){this.localMode?(this.$emit("changed",e.id),this.localSelected=e):this.ChangeSelectedPeriode(e.id)},GetSelectorWidth(){return this.$refs.selectBox!==void 0?this.$refs.selectBox.clientWidth+"px":"500px"},SelectBoxClick(e){this.ShowSelectAffix=e},GetAffixDetails(e){if(this.GetAffixes!=null){for(let r=0;r<this.GetAffixes.length;r++){const c=this.GetAffixes[r];if(c.id===e)return c}return"None"}},DateFormater(e){var r=b(e).fromNow();return r}},computed:{...G(["GetPeriodes","GetAffixes","GetSelectedPeriode","SelectedPeriode"]),getDropdownButtonIcon(){return this.ShowDropdown?"keyboard_arrow_up":"keyboard_arrow_down"},holderPeriode(){return this.localMode?this.localSelected:this.SelectedPeriode}},created(){var e=this;this.localMode&&(this.localSelected=e.GetPeriodes[0]),this.GetSelectedPeriode||setTimeout(()=>{e.ChangeSelectedPeriode(e.GetPeriodes[0].id)},300)}},T={key:0,id:"AffixInfoShower",class:"flex justify-around"},V={key:0},j={class:"flex flex-center"},z={class:"HeaderFont flex-center affixText"},H={key:1,class:"flex justify-center"},L={class:"affixSetListItemInfoMain"},Q=["onClick"],E={class:"HeaderFont"},U={class:"affixSetListItemInfo flex justify-around"},W={key:0},q={key:1},J={class:"affixSetListItem flex justify-around"},K={key:0,class:"flex border justify-between"},O={class:"HeaderFont"},R={key:2,class:"HeaderFont"},X={class:"col-12 flex flex-center"},Y=a("div",{class:"col-12 flex flex-center"},[a("p",null,"if you see this, then that means the webpage have'nt loaded any data yet...")],-1);function Z(e,r,c,$,m,s){const x=P("CloudinaryFormat");return i(),l("div",null,[s.holderPeriode&&!c.hidePictures?(i(),l("div",T,[(i(!0),l(h,null,_(s.holderPeriode.affixes,t=>(i(),l("div",{key:t,class:"flex-center affixItem"},[s.GetAffixDetails(t)?(i(),l("div",V,[a("div",j,[u(x,{url:s.GetAffixDetails(t).icon_Url,size:56},{default:f(({link:n})=>[a("div",{class:"affixImage",style:y({"background-image":"url("+n+")"})},[u(A,null,{default:f(()=>[F(d(s.GetAffixDetails(t).description),1)]),_:2},1024)],4)]),_:2},1032,["url"])]),a("div",z,d(s.GetAffixDetails(t).name),1)])):v("",!0)]))),128))])):v("",!0),e.GetPeriodes?(i(),l("div",H,[u(I,{flat:"","text-color":"grey-6",label:"View other weeks",id:"dropDownButton",modelValue:m.dropdownSelectior,"onUpdate:modelValue":r[0]||(r[0]=t=>m.dropdownSelectior=t),"content-class":"dropDownContainer"},{default:f(()=>[a("div",L,[(i(!0),l(h,null,_(e.GetPeriodes,t=>(i(),l("div",{key:t.id,onClick:n=>{s.ItemClicked(t),m.dropdownSelectior=!1}},[a("div",E,[a("div",U,[a("div",null,"Week: "+d(t.id),1),a("div",null,"Started "+d(s.DateFormater(t.start_timestamp)),1),s.DateFormater(t.end_timestamp).includes("in")?(i(),l("div",W,"Ends "+d(s.DateFormater(t.end_timestamp)),1)):(i(),l("div",q,"Ended "+d(s.DateFormater(t.end_timestamp)),1))])]),a("div",J,[(i(!0),l(h,null,_(t.affixes,n=>(i(),l("div",{key:n},[s.GetAffixDetails(n)?(i(),l("div",K,[u(x,{url:s.GetAffixDetails(n).icon_Url,size:56},{default:f(({link:S})=>[a("div",{class:"affixImageSmall",style:y({"background-image":"url("+S+")"})},null,4)]),_:2},1032,["url"]),a("div",O,d(s.GetAffixDetails(n).name),1)])):v("",!0)]))),128))])],8,Q))),128))])]),_:1},8,["modelValue"])])):(i(),l("div",R,[a("div",X,[u(B,{style:{color:"rgb(161, 161, 161)"},size:750})]),Y]))])}var te=D(M,[["render",Z]]);export{B as Q,te as a};