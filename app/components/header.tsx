import Image from "next/image";

export default function Header() {
  return (
    <div className="hidden lg:flex z-10 max-w-5xl w-half items-center justify-between text-sm">
      <div className="fixed bottom-0 left-0 flex h-16 w-full items-end justify-center bg-gradient-to-t from-white via-white to-transparent dark:from-black dark:via-black dark:to-transparent lg:static lg:h-auto lg:w-auto lg:bg-none">
        <a
          href="https://www.maastrichtuniversity.nl"
          className="flex items-center justify-center font-nunito text-lg font-bold gap-2"
        >
          {/* <span>Powered by</span> */}
          <Image
            // className="rounded-xl"
            src="/UM_logo-transparent.png"
            alt="UM Logo"
            width={180}
            height={30}
            priority
          />
        </a>
      </div>
      <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-white/30 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-white/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-white/30 lg:p-2 lg:dark:bg-white/30 font-open-sans text-black lg:text-xs">
      Update: 9 Mai 2025 - 11:00CET &nbsp;
      </p>
    </div>
  );
}
