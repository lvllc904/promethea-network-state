import { searchSovereignKnowledgeBase, generateGroundedResponse } from '../src/vertex-knowledge-agent';

async function testAgent() {
  console.log('--- Testing Query: "What is ACOM?" ---');
  try {
    const docsAcom = await searchSovereignKnowledgeBase('What is ACOM Anchor Community Model?');
    console.log(`Found ${docsAcom.length} documents for ACOM:`);
    docsAcom.forEach((d, i) => console.log(`  [${i + 1}] ${d.title}: ${d.snippet.substring(0, 100)}...`));

    const responseAcom = await generateGroundedResponse('What is ACOM Anchor Community Model?', docsAcom);
    console.log('\nGrounded Response:\n', responseAcom);
  } catch (err: any) {
    console.error('Error testing ACOM:', err.message);
  }

  console.log('\n--- Testing Query: "How do I list an asset?" ---');
  try {
    const docsAsset = await searchSovereignKnowledgeBase('How do I list an asset UVT real world asset?');
    console.log(`Found ${docsAsset.length} documents for Asset Listing:`);
    docsAsset.forEach((d, i) => console.log(`  [${i + 1}] ${d.title}: ${d.snippet.substring(0, 100)}...`));

    const responseAsset = await generateGroundedResponse('How do I list an asset UVT real world asset?', docsAsset);
    console.log('\nGrounded Response:\n', responseAsset);
  } catch (err: any) {
    console.error('Error testing Asset Listing:', err.message);
  }
}

testAgent();
