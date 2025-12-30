export async function publishToIPFS(data: string): Promise<string> {
  try {
    const formData = new FormData();
    const blob = new Blob([data], { type: 'application/json' });
    formData.append('file', blob);

    const response = await fetch('http://localhost:5001/api/v0/add', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IPFS API error: ${response.statusText} - ${errorText}`);
    }

    const result = (await response.json()) as { Hash: string };
    const cid = result.Hash;

    if (!cid) {
      throw new Error('Failed to get CID from IPFS response');
    }

    return cid;
  } catch (error) {
    console.error('Error publishing to IPFS:', error);
    throw new Error(
      `IPFS publish failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
