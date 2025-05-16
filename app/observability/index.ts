import * as traceloop from "@traceloop/node-server-sdk";
import * as LlamaIndex from "llamaindex";

export const initObservability = () => {
  // Get configuration from environment variables
  const apiKey = process.env.TRACELOOP_API_KEY || "tl_1a595a2448e4407dae47d3ca8d909d6c";
  const appName = process.env.TRACELOOP_APP_NAME || "llama-app-production";
  const disableBatch = process.env.TRACELOOP_DISABLE_BATCH !== "false";
  const debug = process.env.TRACELOOP_DEBUG === "true";
  
  // Initialize Traceloop with environment variables
  traceloop.initialize({
    appName: appName,
    apiKey: apiKey,
    disableBatch: disableBatch,
    instrumentModules: {
      llamaIndex: LlamaIndex,
    },
    // Add debug option if enabled
    ...(debug && { debug: true }),
  });
  
  console.info(`[Observability] Initialized Traceloop with app name: ${appName}, debug: ${debug ? 'enabled' : 'disabled'}`);
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
