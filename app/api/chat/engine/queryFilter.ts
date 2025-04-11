import { MetadataFilter, MetadataFilters } from "llamaindex";

// Track when the module was loaded
const moduleLoadTime = new Date().toISOString();
console.log(`[QueryFilter] Module loaded at ${moduleLoadTime}`);

/**
 * Generate metadata filters for document retrieval
 * 
 * @param documentIds - Array of document IDs to include in the filter
 * @returns MetadataFilters object for use with LlamaIndex
 */
export function generateFilters(documentIds: string[]): MetadataFilters {
  try {
    console.log(`[QueryFilter] Generating filters with documentIds: ${JSON.stringify(documentIds)}`);
    
    // Validate input
    if (!Array.isArray(documentIds)) {
      console.error('[QueryFilter] Invalid documentIds parameter, expected array');
      documentIds = []; // Reset to empty array to prevent errors
    }
    
    // Filter for public documents (those that don't have private=true)
    const publicDocumentsFilter: MetadataFilter = {
      key: "private",
      value: "true",
      operator: "!=",
    };

    // If no documentIds are provided, only retrieve information from public documents
    if (!documentIds.length) {
      console.log('[QueryFilter] No document IDs provided, returning public documents filter only');
      return { filters: [publicDocumentsFilter] };
    }

    // Filter for specific documents by ID
    const privateDocumentsFilter: MetadataFilter = {
      key: "doc_id",
      value: documentIds,
      operator: "in",
    };

    // If documentIds are provided, retrieve information from both public documents
    // and the specified private documents
    // console.log('[QueryFilter] Document IDs provided, returning combined public and private filters');
    return {
      filters: [publicDocumentsFilter, privateDocumentsFilter],
      condition: "or",
    };
  } catch (error) {
    // If anything goes wrong, fall back to just public documents
    console.error('[QueryFilter] Error generating filters:', error);
    return {
      filters: [{
        key: "private",
        value: "true",
        operator: "!=",
      }]
    };
  }
}
