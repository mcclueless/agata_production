/**
 * A service to maintain keyword context across requests
 * This allows us to extract keywords from queries and use them for filtering
 * in subsequent requests, even if those requests don't contain keywords
 */

// Store the last extracted keywords to maintain context across requests
let lastExtractedKeywords: string[] = [];

// Store the timestamp when keywords were last updated
let lastKeywordUpdateTime: number = Date.now();

// TTL for keywords in milliseconds (10 minutes)
const KEYWORD_TTL = 10 * 60 * 1000;

// Track when the module was loaded
const moduleLoadTime = new Date().toISOString();
// console.log(`[KeywordContext] Module loaded at ${moduleLoadTime}`);

// Program keywords dictionary for filtering
// Each program has an array of search terms that must all be present in the query
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

/**
 * Extract education level and program keywords from a query and store them for future use
 */
export function extractAndStoreKeywords(query: string): string[] {
  try {
//    console.log(`[KeywordContext] Extracting keywords from query: "${query}"`);
    
    // Convert query to lowercase for case-insensitive matching
    const lowerQuery = query.toLowerCase();
    const keywords: string[] = [];
    
    // First, check for education level keywords (maintaining mutual exclusivity)
    if (lowerQuery.includes('bachelor') || 
        lowerQuery.includes('bachelors') || 
        lowerQuery.includes('undergraduate')) {
      keywords.push('bachelor');
    } else if (lowerQuery.includes('master') || 
        lowerQuery.includes('masters') || 
        lowerQuery.includes('graduate') || 
        lowerQuery.includes('postgraduate')) {
      keywords.push('master');
    }
    
    // Then, check for program keywords
    for (const [program, searchTerms] of Object.entries(PROGRAM_KEYWORDS)) {
      // Check if all search terms for this program are in the query
      if (searchTerms.every(term => lowerQuery.includes(term))) {
        keywords.push(program);
      }
    }
    
    // If keywords were found, update the stored keywords and timestamp
    if (keywords.length > 0) {
    //   console.log(`[KeywordContext] Extracted keywords: ${JSON.stringify(keywords)}`);
    //   console.log(`[KeywordContext] Previous keywords: ${JSON.stringify(lastExtractedKeywords)}`);
      lastExtractedKeywords = [...keywords];
      lastKeywordUpdateTime = Date.now();
    //   console.log(`[KeywordContext] Updated keywords: ${JSON.stringify(lastExtractedKeywords)}`);
    } else {
    //   console.log(`[KeywordContext] No keywords found in query`);
    }
    
    return keywords;
  } catch (error) {
    // console.error('[KeywordContext] Error extracting keywords:', error);
    return [];
  }
}

/**
 * Get the last extracted keywords, respecting TTL
 */
export function getLastKeywords(): string[] {
  try {
    // Check if keywords have expired
    const now = Date.now();
    if (now - lastKeywordUpdateTime > KEYWORD_TTL) {
      // Keywords have expired, clear them
    //   console.log('[KeywordContext] Keywords have expired, clearing them');
      lastExtractedKeywords = [];
      return [];
    }
    
    // console.log(`[KeywordContext] Getting last keywords: ${JSON.stringify(lastExtractedKeywords)}`);
    return lastExtractedKeywords;
  } catch (error) {
    // console.error('[KeywordContext] Error getting last keywords:', error);
    return [];
  }
}

/**
 * Clear the stored keywords
 */
export function clearKeywords(): void {
  try {
    lastExtractedKeywords = [];
    lastKeywordUpdateTime = 0; // Reset timestamp to ensure TTL check will expire
    // console.log('[KeywordContext] Cleared stored keywords');
  } catch (error) {
    // console.error('[KeywordContext] Error clearing keywords:', error);
  }
}
