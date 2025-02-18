var G=a=>{throw TypeError(a)};var x=(a,e,t)=>e.has(a)||G("Cannot "+t);var o=(a,e,t)=>(x(a,e,"read from private field"),t?t.call(a):e.get(a)),u=(a,e,t)=>e.has(a)?G("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(a):e.set(a,t),f=(a,e,t,n)=>(x(a,e,"write to private field"),n?n.call(a,t):e.set(a,t),t);var H={waveformWidth:500,waveformHeight:80,waveformColor:"#000",barAlign:"center",barWidth:1,barGap:0,drawMode:"png"};async function B(a){return new Promise((e,t)=>{new AudioContext().decodeAudioData(a,r=>{r?e(r):t(new Error("Could not decode audio data"))})})}function W(a,e){let t=document.createElement("svg");return t.id=crypto.randomUUID(),t.setAttribute("xmlns","http://www.w3.org/2000/svg"),t.setAttribute("version","1.1"),t.setAttributeNS(null,"viewBox",`0 0 ${a} ${e}`),t}function D(a,e){let t=document.createElement("canvas");return t.id=crypto.randomUUID(),t.width=a,t.height=e,t}var p,v,c,w,b,d,y=class{constructor(e){u(this,p);u(this,v);u(this,c);u(this,w);u(this,b);u(this,d,H);f(this,p,e)}async getWaveform(e=H){f(this,d,Object.assign({},H,e));let{waveformWidth:t,waveformHeight:n,drawMode:r}=o(this,d);return o(this,v)||f(this,v,await B(o(this,p).slice(0))),r==="png"?(f(this,w,D(t,n)),f(this,b,o(this,w).getContext("2d"))):r==="svg"&&(f(this,c,W(t,n)),o(this,c).appendChild(this.generateSVGStylesheet())),this.drawWaveform(o(this,v)),r==="png"?o(this,w).toDataURL():`data:image/svg+xml;base64,${btoa(`<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">${o(this,c).outerHTML}`)}`}generateSVGStylesheet(){let{waveformColor:e,barWidth:t,barGap:n}=o(this,d),r=document.createElement("style");r.setAttribute("type","text/css");let s=n!==0?t*Math.abs(1-n):t;return r.appendChild(document.createTextNode(`path{stroke:${e};stroke-width:${s}}`)),r}drawBarToCanvas(e,t,n){let{waveformColor:r,barWidth:s}=o(this,d),m=Math.floor(e-1),h=Math.floor(t-1);o(this,b).fillStyle=r,o(this,b).fillRect(m,h,s,n)}drawBarToSVG(e,t,n){let r=document.createElement("path");r.setAttribute("d",`M${e} ${t} L${e} ${t+n} Z`),o(this,c).appendChild(r)}drawBar({position:e,height:t,isPositive:n}){let{barGap:r,barAlign:s,waveformHeight:m,drawMode:h}=o(this,d),{barWidth:C}=o(this,d);r!==0&&(C*=Math.abs(1-r));let g=e+C/2,A=m/2,l;switch(s){case"top":l=0;break;case"bottom":l=m-t;break;case"center":default:l=n?A-t:A;break}if(h==="png")this.drawBarToCanvas(g,l,t);else if(h==="svg")this.drawBarToSVG(g,l,t);else throw new Error(`Unsupported drawMode in options; ${h}. Allowed: png, svg`)}bufferMeasure(e,t,n){let r=0;for(let s=e;s<e+t;s++)r+=n[s]**2;return Math.sqrt(r/t)}drawWaveform(e){let t=e.getChannelData(0),n=e.numberOfChannels>1?e.getChannelData(1):t,{waveformWidth:r,waveformHeight:s,barWidth:m}=o(this,d),h=Math.floor(t.length/r),C=s/2,g=[];for(let i=0;i<r;i+=m){let M=this.bufferMeasure(i*h,h,t),S=this.bufferMeasure(i*h,h,n);g.push({position:i,positiveHeight:M,negativeHeight:S})}let A=Math.max(...g.map(i=>Math.max(i.positiveHeight,i.negativeHeight))),l=C/A;for(let{position:i,positiveHeight:M,negativeHeight:S}of g)this.drawBar({position:i,height:M*l,isPositive:!0}),this.drawBar({position:i,height:S*l,isPositive:!1})}};p=new WeakMap,v=new WeakMap,c=new WeakMap,w=new WeakMap,b=new WeakMap,d=new WeakMap;var T=y;export{T as default};
//# sourceMappingURL=index.js.map
