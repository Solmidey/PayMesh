import * as React from "react";
export default function Button({children,className="",...props}:{children:React.ReactNode} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={"inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium text-white transition shadow-[0_8px_30px_rgba(2,12,27,.25)] bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 hover:brightness-110 active:brightness-95 "+className}
      {...props}
    >
      {children}
    </button>
  );
}
