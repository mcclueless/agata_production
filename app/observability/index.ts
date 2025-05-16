import * as traceloop from "@traceloop/node-server-sdk";
import * as LlamaIndex from "llamaindex";

export const initObservability = () => {
  traceloop.initialize({
    appName: "llama-app-production",
    apiKey:"tl_1a595a2448e4407dae47d3ca8d909d6c",
    // development: tl_1a595a2448e4407dae47d3ca8d909d6c
    // production: tl_fc1e0f89af3348e8adce9eb66e21ad07
    disableBatch: true,
    instrumentModules: {
      llamaIndex: LlamaIndex,
    },
  });
  
  console.info("[Observability] Initialized with Traceloop SDK");
};

// Check if observability is initialized
export const isObservabilityInitialized = (): boolean => {
  try {
    // This is a simple check - we're just seeing if the module was imported
    return !!traceloop;
  } catch (error) {
    console.error('Error checking observability initialization status:', error);
    return false;
  }
};
