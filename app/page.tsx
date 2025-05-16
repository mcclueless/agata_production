import Header from "@/app/components/header";
import ChatSection from "./components/chat-section";

export default function Home() {
  return (
    <main className="h-screen w-screen flex justify-center items-center lg:items-start lg:pt-4 lg:pb-4 h-full">
      <div className="space-y-0 lg:space-y-4 w-[90%] lg:w-[60rem]">
        <Header />
        <div className="h-[90vh] lg:h-[86vh] flex">
          <ChatSection />
        </div>
      </div>
    </main>
  );
}
