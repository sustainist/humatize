import{A as e,C as t,D as n,E as r,I as i,K as a,L as o,M as s,N as c,P as l,Q as u,R as d,S as f,Y as p,Z as m,b as h,g,k as _,l as v,n as y,p as b,q as x,v as S,w as C,x as w,z as T}from"./index-B3bK5JHN.js";var E=C(`<style id="style-scroll">.button-scroll {
        position: fixed;
        bottom: 0.5ch;
        z-index: 100;

        button {
          background-color: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
          transition: opacity 400ms;
          opacity: 0.5;
          font-family: monospace;

          &:hover {
            opacity: 1;
          }

          .symbol {
            font-size: 1.5rem;
            line-height: 1;
            display: block;
            rotate: -90deg;
          }
        }
      }
      .large {
        #app > *:not(nav.toc).button-scroll {
          margin-left: initial;
          margin-right: initial;
        }
      }</style>`);function D(e){g(`1oalzf9`,e=>{var n=t(),r=c(n),i=e=>{f(e,E())};h(r,e=>{document.getElementById(`style-scroll`)||e(i)}),f(e,n)})}var O=C(`<div class="button-scroll toc svelte-bwfonw"><button title="Jump to the top of the table of contents" type="button"><span class="symbol">&#x203A;</span></button></div>`),k=C(`<!> <!>`,1);function A(e,t){x(t,!0);function r(e){if(!e)return!1;let t=e.getBoundingClientRect(),n=window.innerHeight||document.documentElement.clientHeight,r=window.innerWidth||document.documentElement.clientWidth;return!(t.top>=-30&&t.left>=0&&t.bottom<=n+30&&t.right<=r)}let u=()=>{i(m,r(document.querySelector(`#app>nav.toc>:first-child`)),!0)},d=()=>{window.dispatchEvent(new Event(`scroll`))},m=o(!1);y(()=>(window.addEventListener(`scroll`,u),document.querySelector(`#app>nav.toc`)?.addEventListener(`scroll`,d),()=>{window.removeEventListener(`scroll`,u),document.querySelector(`#app>nav.toc`)?.removeEventListener(`scroll`,d)}));var g=k(),v=c(g);D(v,{});var b=l(v,2),S=e=>{var t=O(),r=s(t);p(t),n(`pointerdown`,r,()=>{document.querySelector(`#app>nav.toc>:first-child`)?.scrollIntoView({block:`start`})}),f(e,t)};h(b,e=>{_(m)&&e(S)}),f(e,g),a()}r([`pointerdown`]);var j=(n,r=u)=>{var i=t(),a=c(i),o=t=>{var n=P();S(n,23,r,({id:e,index:t,text:n,children:r=[]},i)=>e||i,(t,n)=>{let r=()=>_(n).id,i=()=>_(n).index,a=()=>_(n).text,o=d(()=>m(_(n).children,()=>[],!0)),c=T(()=>(i()?.length||1)-1);var u=N(),g=s(u),y=t=>{var n=M(),o=s(n),c=s(o,!0);p(o);var u=l(o,2),d=s(u,!0);p(u),p(n),e(e=>{v(n,`href`,`/#${r()??``}`),w(c,e),w(d,a())},[()=>i()?.join(`.`)]),f(t,n)};h(g,e=>{a()&&r()&&e(y)}),j(l(g,2),()=>_(o)),p(u),e(()=>b(u,`--indent:${_(c)>1?_(c)-1:0}`)),f(t,u)}),p(n),f(t,n)};h(a,e=>{r().length&&e(o)}),f(n,i)},M=C(`<a class="svelte-17luj61"><span class="index svelte-17luj61"> </span> <span class="label svelte-17luj61"> </span></a>`),N=C(`<li class="svelte-17luj61"><!> <!></li>`),P=C(`<ol class="list svelte-17luj61"></ol>`),F=C(`<p><small>No headings found</small></p>`),I=C(`<nav class="toc svelte-17luj61"><div class="inner svelte-17luj61"><h1 class="title svelte-17luj61">Table of Contents</h1> <!></div></nav>`),L=C(`<p><small>Toc list is empty</small></p>`),R=C(`<!> <!>`,1);function z(e,t){var n=R(),r=c(n),i=e=>{let n=T(()=>JSON.parse(t.list||`[]`));var r=I(),i=s(r),a=l(s(i),2),o=e=>{j(e,()=>_(n))},c=e=>{var t=F();b(s(t),``,{},{color:`red`}),p(t),f(e,t)};h(a,e=>{_(n).length?e(o):e(c,-1)}),p(i),p(r),f(e,r)},a=e=>{var t=L();b(s(t),``,{},{color:`red`}),p(t),f(e,t)};h(r,e=>{t.list?e(i):e(a,-1)}),A(l(r,2),{}),f(e,n)}export{z as default};