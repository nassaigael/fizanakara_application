import{Dt as e,Ot as t,it as n}from"./index-DRN2HZqm.js";var r=t(e(),1),i=n(),a=(0,r.memo)(({children:e,variant:t=`primary`,isLoading:n=!1,className:r=``,disabled:a,icon:o,fullWidth:s=!1,...c})=>{let l=`
        px-4 sm:px-6 py-3 sm:py-4 
        rounded-xl sm:rounded-2xl 
        font-black uppercase tracking-wide text-xs sm:text-sm 
        border-2 border-b-4 
        transition-all active:translate-y-[1px] 
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed 
        outline-none focus-visible:ring-2 ring-offset-2 ring-brand-primary
        ${s?`w-full`:``}
    `,u={primary:`bg-brand-primary text-white border-brand-primary hover:opacity-90`,secondary:`bg-white text-brand-text border-brand-border hover:bg-brand-primary/10`,danger:`bg-red-500 text-white border-red-600 hover:bg-red-400`,warning:`bg-orange-500 text-white border-orange-600 hover:bg-orange-400`,ghost:`bg-transparent border-transparent text-brand-text hover:bg-gray-100`};return(0,i.jsx)(`button`,{...c,disabled:a||n,className:`${l} ${u[t]} ${r}`,children:n?(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(`div`,{className:`w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin`}),(0,i.jsx)(`span`,{children:`Chargement...`})]}):(0,i.jsxs)(i.Fragment,{children:[o,e]})})});export{a as t};