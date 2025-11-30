import Brand from "@/components/ui/Brand";
export default function Header(){
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/30 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Brand />
      </div>
    </header>
  );
}
