import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 dark:bg-black">
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-6 rounded-lg bg-gray-800 px-6 py-10">
        <h1 className="text-xl font-bold md:text-3xl md:leading-normal text-center text-white">
          Welcome to Your App. <span className="block">Manage reservations efficiently.</span>
        </h1>
        <Button 
          asChild 
          variant="default"
          className="w-full sm:w-auto bg-[#4285f4] hover:bg-[#357ae8] text-white"
        >
          <Link href="/login">
            Log in
          </Link>
        </Button>
      </div>
    </main>
  )
}

