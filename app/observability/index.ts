import * as traceloop from "@traceloop/node-server-sdk";
import * as LlamaIndex from "llamaindex";

export const initObservability = () => {
  traceloop.initialize({
    appName: "llama-app-production",
    apiKey:"8ad82fe7bc1db05540ad408232fb6499ee65a650f35599412337f6dcf3b7121233c35cc141afe37cde496cfb1544bb9f",
    disableBatch: true,
    instrumentModules: {
      llamaIndex: LlamaIndex,
    },
  });
};
