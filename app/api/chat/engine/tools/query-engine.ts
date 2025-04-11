import {
    BaseQueryEngine,
    CloudRetrieveParams,
    LlamaCloudIndex,
    MetadataFilters,
    QueryEngineTool,
    VectorStoreIndex,
  } from "llamaindex";
  import { generateFilters } from "../queryFilter";
  import { getLastKeywords, extractAndStoreKeywords } from "../keywordContext";
  
  // Program keywords dictionary for filtering (must match the one in keywordContext.ts)
  const PROGRAM_KEYWORDS: Record<string, string[]> = {
    // Existing entries
    'arts and culture': ['arts', 'culture'],
    'biomedical sciences': ['biomedical', 'sciences'],
    'digital society': ['digital', 'society'],
    'econometrics and operations research': ['econometrics', 'operations', 'research'],
    'economics and business economics': ['economics', 'business'],
    'european law school': ['european', 'law', 'school'],
    'european public health': ['european', 'public', 'health'],
    'european studies': ['european', 'studies'],
    'global studies': ['global', 'studies'],
    'health sciences': ['health', 'sciences'],
    'international business': ['international', 'business'],
    'medicine': ['medicine'],
    'psychology': ['psychology'],
    'regenerative medicine and technology': ['regenerative', 'medicine', 'technology'],
    'business science analytics': ['business', 'science', 'analytics'],
    'brain science': ['brain', 'science'],
    'business engineering': ['business', 'engineering'],
    'circular engineering': ['circular', 'engineering'],
    'computer science': ['computer', 'science'],
    'data science and artificial intelligence': ['data', 'science', 'artificial', 'intelligence'],
    'maastricht science programme': ['maastricht', 'science', 'programme'],
    'university college maastricht': ['university', 'college', 'maastricht'],
    'university college venlo': ['university', 'college', 'venlo'],
    'tax law': ['tax', 'law'],
    'dutch law': ['dutch', 'law'],
    
    // New entries
    'biobased materials': ['biobased', 'materials'],
    'systems biology and bioninformatics': ['systems', 'biology', 'bioninformatics'],
    'health food innovation management': ['health', 'food', 'innovation', 'management'],
    'sustainability science policy and society': ['sustainability', 'science', 'policy', 'society'],
    'epidemiology': ['epidemiology'],
    'public policy and human development': ['public', 'policy', 'human', 'development'],
    'economics': ['economics'],
    'global supply chain management and change': ['global', 'supply', 'chain', 'management'],
    'global health': ['global', 'health'],
    'financial economics': ['financial', 'economics'],
    'forensic psychology': ['forensic', 'psychology'],
    'international laws': ['international', 'laws'],
    'media studies digital cultures': ['media', 'studies', 'digital', 'cultures'],
    'advanced privacy cybersecurity and data management': ['privacy', 'cybersecurity', 'data', 'management'],
    'advanced intellectual property law and knowledge management': ['intellectual', 'property', 'law', 'knowledge', 'management'],
    'artificial intelligence': ['artificial', 'intelligence'],
    'business intelligence and smart services': ['business', 'intelligence', 'smart', 'services'],
    'research cultures arts science and technology': ['research', 'cultures', 'arts', 'science', 'technology'],
    'data science decision making': ['data', 'science', 'decision', 'making'],
    'digital business and economics': ['digital', 'business', 'economics'],
    'economics and financial research': ['economics', 'financial', 'research'],
    'economics and strategy emerging markets': ['economics', 'strategy', 'emerging', 'markets'],
    'european studies society and technology': ['european', 'studies', 'society', 'technology'],
    'forensica criminologie en rechtspleging': ['forensica', 'criminologie', 'rechtspleging'],
    'forensics criminology and law': ['forensics', 'criminology', 'law'],
    'globalisation and development studies': ['globalisation', 'development', 'studies'],
    'globalisation and law': ['globalisation', 'law'],
    'health and digital transformation': ['health', 'digital', 'transformation'],
    'health education and promotion': ['health', 'education', 'promotion'],
    'healthcare policy innovation and management': ['healthcare', 'policy', 'innovation', 'management'],
    'human decision science': ['human', 'decision', 'science'],
    'human movement sciences': ['human', 'movement', 'sciences'],
    'imaging engineering': ['imaging', 'engineering'],
    'international and european tax law': ['international', 'european', 'tax', 'law'],
    'international joint research work and organisational psychology': ['international', 'joint', 'research', 'work', 'organisational', 'psychology'],
    'law and labour': ['law', 'labour'],
    'learning and development organisations': ['learning', 'development', 'organisations'],
    'mental health': ['mental', 'health'],
    'occupational health and sustainable work': ['occupational', 'health', 'sustainable', 'work'],
    'physician-clinical investigator': ['physician', 'clinical', 'investigator'],
    'research cognitive and clinical neuroscience': ['research', 'cognitive', 'clinical', 'neuroscience']
  };
  
  interface QueryEngineParams {
    documentIds?: string[];
    topK?: number;
  }
  
  export function createQueryEngineTool(
    index: VectorStoreIndex | LlamaCloudIndex,
    params?: QueryEngineParams,
    name?: string,
    description?: string,
  ): QueryEngineTool {
    return new QueryEngineTool({
      queryEngine: createQueryEngine(index, params),
      metadata: {
        name: name || "query_engine",
        description:
          description ||
          `Use this tool to retrieve information about the text corpus from an index.`,
      },
    });
  }
  
  function createQueryEngine(
    index: VectorStoreIndex | LlamaCloudIndex,
    params?: QueryEngineParams,
  ): BaseQueryEngine {
    const baseQueryParams = {
      similarityTopK:
        params?.topK ??
        (process.env.TOP_K ? parseInt(process.env.TOP_K) : undefined),
    };
  
    let queryEngine: BaseQueryEngine;
  
    if (index instanceof LlamaCloudIndex) {
      queryEngine = index.asQueryEngine({
        ...baseQueryParams,
        retrieval_mode: "auto_routed",
        preFilters: generateFilters(
          params?.documentIds || [],
        ) as CloudRetrieveParams["filters"],
      });
    } else {
      queryEngine = index.asQueryEngine({
        ...baseQueryParams,
        preFilters: generateFilters(params?.documentIds || []) as MetadataFilters,
      });
    }
  
    // Add a hook to log the query before it's executed
    // We'll use monkey patching to add logging to the query engine
    const originalRetrieve = (queryEngine as any).retrieve;
    if (originalRetrieve) {
      (queryEngine as any).retrieve = async function(query: any) {
        try {
          // Log the query
          const queryText = query.query || query;
          console.log(`[QueryEngine] Query passed to Retriever: "${queryText}"`);
          
          // Extract and store keywords from the query
          const extractedKeywords = extractAndStoreKeywords(queryText);
          console.log(`[QueryEngine] Extracted keywords from query: ${JSON.stringify(extractedKeywords)}`);
          
          // Call the original retrieve method
          const result = await originalRetrieve.call(this, query);
          
          // Debug log to check if we're getting here
          console.log(`[QueryEngine] DEBUG: Retrieved result from originalRetrieve`);
          console.log(`[QueryEngine] DEBUG: Result type: ${typeof result}`);
          console.log(`[QueryEngine] DEBUG: Result keys: ${Object.keys(result || {}).join(', ')}`);
        
          // Log the response of the retriever - simplified version
          const nodesCount = result.sourceNodes?.length || 
                            result.nodes?.length || 
                            (result.detail?.nodes?.length) || 
                            (Array.isArray(result) ? result.length : 0);
          
          console.log(`[QueryEngine] DEBUG: Nodes count: ${nodesCount}`);
          
          // Get source nodes from the result, handling different result structures
          const sourceNodes = result.sourceNodes || 
                             result.nodes || 
                             result.detail?.nodes || 
                             (Array.isArray(result) ? result : []);
          
          console.log(`[QueryEngine] DEBUG: Source nodes length: ${sourceNodes.length}`);
          
          const filenames = sourceNodes.slice(0, Math.min(5, sourceNodes.length))
            .map((node: any, index: number) => {
              const metadata = node.metadata || node.node?.metadata || {};
              return `${index + 1}: ${metadata.file_name || metadata.file_path || 'unknown'}`;
            });
          
          console.log(`[QueryEngine] Retriever response: resultKeys=[${Object.keys(result || {}).join(', ')}], nodesCount=${nodesCount}, filenames=[${filenames.join(', ')}]`);
          
          // Get the last extracted keywords
          const keywords = getLastKeywords();
          console.log(`[QueryEngine] DEBUG: Keywords from keywordContext: ${JSON.stringify(keywords)}`);
          
          // Apply keyword filtering if keywords are available
          if (keywords.length > 0) {
            console.log(`[QueryEngine] Filtering nodes by keywords: ${JSON.stringify(keywords)}`);
            
            // Filter the nodes based on keywords in filename
            const filteredNodes = sourceNodes.filter((node: any) => {
              try {
                const metadata = node.metadata || node.node?.metadata || {};
                const filename = (metadata.file_name || metadata.file_path || '').toLowerCase();
                
                // First, check education level keyword (if present)
                const educationLevelKeyword = keywords.find(k => k === 'bachelor' || k === 'master');
                if (educationLevelKeyword && !filename.includes(educationLevelKeyword)) {
                  console.log(`[QueryEngine] DEBUG: Node ${filename} does not match education level "${educationLevelKeyword}"`);
                  return false; // Must match education level if specified
                }
                
                // Then, check program keywords
                const programKeywords = keywords.filter(k => k !== 'bachelor' && k !== 'master');
                if (programKeywords.length > 0) {
                  // Must match at least one program keyword if any are specified
                  const matchesProgram = programKeywords.some(keyword => {
                    // For multi-word keywords, check if all parts are in the filename
                    const searchTerms = PROGRAM_KEYWORDS[keyword] || [keyword];
                    const matches = searchTerms.every(term => filename.includes(term));
                    console.log(`[QueryEngine] DEBUG: Node ${filename} matches program "${keyword}": ${matches}`);
                    return matches;
                  });
                  
                  if (!matchesProgram) {
                    console.log(`[QueryEngine] DEBUG: Node ${filename} does not match any program keywords`);
                    return false;
                  }
                }
                
                // If we got here, the node matches all required criteria
                console.log(`[QueryEngine] DEBUG: Node ${filename} passes all filters`);
                return true;
              } catch (nodeError) {
                // If there's an error processing a node, keep it in the results
                // rather than failing the entire operation
                console.error(`[QueryEngine] Error processing node:`, nodeError);
                return true;
              }
            });
            
            console.log(`[QueryEngine] Filtered ${sourceNodes.length} nodes down to ${filteredNodes.length} nodes`);
            
            // Log the filtered nodes
            const filteredFilenames = filteredNodes.map((node: any, index: number) => {
              const metadata = node.metadata || node.node?.metadata || {};
              return `${index + 1}: ${metadata.file_name || metadata.file_path || 'unknown'}`;
            });
            console.log(`[QueryEngine] Filtered nodes: [${filteredFilenames.join(', ')}]`);
            
            // Log a sample of the first filtered node's content if available
            if (filteredNodes.length > 0) {
              const firstNode = filteredNodes[0];
              const nodeText = firstNode.text || 
                              firstNode.node?.text || 
                              firstNode.node?.getContent?.() || 
                              'No text available';
              console.log(`[QueryEngine] First filtered node sample: "${nodeText.substring(0, 100)}${nodeText.length > 100 ? '...' : ''}"`);
            }
            
            // Update the result object with filtered nodes
            try {
              if (result.sourceNodes) {
                result.sourceNodes = filteredNodes;
              } else if (result.nodes) {
                result.nodes = filteredNodes;
              } else if (result.detail?.nodes) {
                result.detail.nodes = filteredNodes;
              } else if (Array.isArray(result)) {
                // If result is an array, replace it with filtered nodes
                result.length = 0;
                filteredNodes.forEach((node: any) => result.push(node));
              }
              
              console.log(`[QueryEngine] Result object updated with filtered nodes`);
            } catch (updateError) {
              console.error(`[QueryEngine] Error updating result with filtered nodes:`, updateError);
              // Continue with original result if updating fails
            }
          } else {
            console.log(`[QueryEngine] No keywords found, skipping filtering`);
          }
          
          return result;
        } catch (error) {
          console.error(`[QueryEngine] Error in retrieve method:`, error);
          // Return an empty result rather than throwing to prevent API failures
          return { sourceNodes: [], nodes: [] };
        }
      };
    }
  
    return queryEngine;
  }
  