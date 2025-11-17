import * as React from "react";
export default function Panel({title,right,children}:{title:string;right?:React.ReactNode;children:React.ReactNode}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,.5)]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h3 className="text-base font-medium tracking-tight">{title}</h3>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
