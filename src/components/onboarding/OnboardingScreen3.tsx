import { Command } from "lucide-react";

const OnboardingScreen3 = () => {
  return (
    <div className="min-h-screen bg-theme-bg-primary flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Keyboard Keys */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
          <div className="w-16 h-16 sm:w-36 sm:h-36 bg-theme-bg-secondary rounded-xl shadow-lg flex items-center justify-center border-8 border-theme-primary-active">
            <Command
              size={24}
              className="text-theme-chat-assistant-text sm:w-8 sm:h-8"
            />
          </div>
          <div className="w-16 h-16 sm:w-36 sm:h-36 bg-theme-bg-secondary rounded-xl shadow-lg flex items-center justify-center border-8 border-theme-primary-active">
            <span className="text-3xl sm:text-4xl font-serif italic font-bold text-theme-chat-assistant-text">
              K
            </span>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-light  text-theme-chat-assistant-text leading-tight px-4">
            Quickly access all your tools by pressing{" "}
            <kbd className=" font-serif italic  ">Cmd</kbd> +{" "}
            <kbd className=" font-serif italic  ">K</kbd>. like chat
            history,gallery,userPrompt,Pinned chats,BYOK and more ..... :)
          </h1>
        </div>

        {/* Navigation Button */}
      </div>
    </div>
  );
};

export default OnboardingScreen3;
