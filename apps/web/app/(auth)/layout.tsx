import { MogojMark } from "@/components/layout/MogojMark";
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-4 text-center">
          <span className="inline-flex items-center gap-2.5 text-lg font-medium"><MogojMark size={22} />Mogoj</span>
        </div>
        {children}
      </div>
    </div>
  );
}
