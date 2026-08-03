import {
  SearchServiceClient,
  DocumentServiceClient,
} from '@google-cloud/discoveryengine';
import { VertexAI } from '@google-cloud/vertexai';

const PROJECT_ID = 'studio-9105849211-9ba48';
const LOCATION = 'global'; // or 'us-central1'
const DATA_STORE_ID = 'promethea-knowledge-base'; 

// Initialize Discovery Engine for Grounded RAG Search
const searchClient = new SearchServiceClient();

// Initialize Vertex AI for Generation
const vertex_ai = new VertexAI({ project: PROJECT_ID, location: 'us-central1' });

// Flash for fast UI interaction, Pro for complex legal queries
const geminiFlash = vertex_ai.preview.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.2,
  },
});

const geminiPro = vertex_ai.preview.getGenerativeModel({
  model: 'gemini-1.5-pro',
  generationConfig: {
    temperature: 0.1,
  },
});

/**
 * Searches the Vertex AI Data Store for grounded documents.
 */
export async function searchSovereignKnowledgeBase(query: string) {
  const name = searchClient.projectLocationCollectionDataStoreBranchPath(
    PROJECT_ID,
    LOCATION,
    'default_collection',
    DATA_STORE_ID,
    '0'
  );

  const request = {
    servingConfig: name.replace('branches/0', 'servingConfigs/default_search'),
    query: query,
    pageSize: 5,
  };

  const [response] = await searchClient.search(request as any);
  return response.map(r => ({
    title: r.document?.structData?.fields?.title?.stringValue || 'Document',
    link: r.document?.structData?.fields?.link?.stringValue || '#',
    snippet: (r.document?.derivedStructData?.fields?.snippets?.listValue?.values?.[0] as any)?.structData?.fields?.snippet?.stringValue || ''
  })) || [];
}

/**
 * Generates a grounded response using Gemini 1.5 Flash and citations from the Data Store.
 */
export async function generateGroundedResponse(query: string, contextDocs: any[]) {
  const contextText = contextDocs.map(d => `Title: ${d.title}\nLink: ${d.link}\nSnippet: ${d.snippet}`).join('\n\n');
  
  const prompt = `
You are Promethea, the Sovereign Steward of the Promethean Network State (TPNS).
Answer the citizen's query based ONLY on the following grounded documents.
If the answer is not in the documents, state that you do not have that knowledge.
Include Markdown links to the source documents when you cite them.

Documents:
${contextText}

Query: ${query}
`;

  const result = await geminiFlash.generateContent(prompt);
  return result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Tool definitions for Sovereign WebMCP Actions (DO and CONTROL)
 */
export const vertexActionTools = [
  {
    name: "switch_cockpit_view",
    description: "Switches the user's cockpit view between LP, GP, and Admin.",
    parameters: {
      type: "object",
      properties: {
        mode: { type: "string", enum: ["LP", "GP", "ADMIN"] }
      },
      required: ["mode"]
    }
  },
  {
    name: "draft_ucc1_filing",
    description: "Drafts a UCC-1 financing statement for an asset.",
    parameters: {
      type: "object",
      properties: {
        assetName: { type: "string" },
        collateralDescription: { type: "string" }
      },
      required: ["assetName", "collateralDescription"]
    }
  },
  {
    name: "execute_spv_setup",
    description: "Generates the necessary state payloads to setup a new Series SPV.",
    parameters: {
      type: "object",
      properties: {
        spvName: { type: "string" },
        seriesDesignation: { type: "string" }
      },
      required: ["spvName", "seriesDesignation"]
    }
  }
];
