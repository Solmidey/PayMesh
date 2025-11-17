import Image from "next/image";
import Link from "next/link";
export default function Brand(){
  return (
    <Link href="/" className="group inline-flex items-center gap-2">
      <Image src="/logo.png" alt="PayMesh logo" width={28} height={28} priority className="h-7 w-7 select-none"/>
      <span className="text-lg font-semibold tracking-tight group-hover:opacity-90">PayMesh</span>
    </Link>
  );
}
