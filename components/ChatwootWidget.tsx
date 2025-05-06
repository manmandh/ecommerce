"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    chatwootSettings?: {
      hideMessageBubble?: boolean;
      position?: "left" | "right";
      locale?: string;
      type?: string;
    };
    chatwootSDK?: {
      run: (config: { websiteToken: string; baseUrl: string }) => void;
    };
  }
}

const ChatwootWidget = () => {
  useEffect(() => {
    window.chatwootSettings = {
      hideMessageBubble: false,
      position: "right",
      locale: "en",
      type: "standard",
    };

    const script = document.createElement("script");
    script.src = "https://app.chatwoot.com/packs/js/sdk.js";
    script.defer = true;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.chatwootSDK) {
        window.chatwootSDK.run({
          websiteToken: "ae519FHnvE2JAsLo1zJwYpqd",
          baseUrl: "https://app.chatwoot.com",
        });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
};

export default ChatwootWidget;
