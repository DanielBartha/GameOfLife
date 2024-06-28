import 'dotenv/config';
import { BlobServiceClient } from '@azure/storage-blob';
import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';
import { ApiKeyCredentials } from '@azure/ms-rest-js';

// Azure Blob Storage credentials from environment variables
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'gamestatepng'; // Use the container name listed

// Azure Computer Vision credentials from environment variables
const subscriptionKey = process.env.COMPUTER_VISION_SUBSCRIPTION_KEY;
const endpoint = process.env.COMPUTER_VISION_ENDPOINT;

// Initialize Blob Service client with SAS token or credentials
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

// Initialize Computer Vision client using subscription key
const computerVisionClient = new ComputerVisionClient(
  new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': subscriptionKey } }), 
  endpoint
);

// Function to analyze image
async function analyzeImage(blobUrl) {
  const visualFeatures = ['Categories', 'Description', 'Color'];
  const analysis = await computerVisionClient.analyzeImage(blobUrl, { visualFeatures });
  return analysis;
}

// Function to list containers for debugging
async function listContainers() {
  const containers = [];
  let iter = blobServiceClient.listContainers();
  for await (const container of iter) {
    containers.push(container.name);
  }
  console.log('Containers in the storage account:', containers);
  return containers;
}

// Analyze images in Blob container
async function analyzeImagesInContainer() {
  // List containers for debugging
  const containers = await listContainers();

  // Check if specified container exists
  if (!containers.includes(containerName)) {
    throw new Error(`The specified container "${containerName}" does not exist.`);
  }

  const containerClient = blobServiceClient.getContainerClient(containerName);
  let iter = containerClient.listBlobsFlat();
  let blobItem = await iter.next();

  while (!blobItem.done) {
    const blobName = blobItem.value.name;

    // Generate SAS token for the blob
    const sasToken = generateBlobSAS(containerName, blobName);

    // Construct blob URL with SAS token
    const blobUrl = `https://${blobServiceClient.accountName}.blob.core.windows.net/${containerName}/${blobName}${sasToken}`;

    console.log(`Analyzing ${blobName}...`);
    const analysis = await analyzeImage(blobUrl);

    console.log(`Analysis for ${blobName}:`);
    console.log(`Categories: ${JSON.stringify(analysis.categories)}`);
    console.log(`Description: ${JSON.stringify(analysis.description.captions)}`);
    console.log(`Color: ${JSON.stringify(analysis.color)}`);
    console.log();

    blobItem = await iter.next();
  }
}

// Function to generate SAS token for the blob
function generateBlobSAS(containerName, blobName) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);

  // Set SAS token expiry time (e.g., 1 hour from now)
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 1); // 1 hour expiry

  const permissions = {
    read: true, // Allow read access to the blob
    // Add more permissions as needed
  };

  // Generate SAS token
  const sasToken = blobClient.generateSasUrl({
    permissions, // Pass permissions object here
    expiresOn: expiryDate
  });

  return sasToken;
}

analyzeImagesInContainer().catch((err) => {
  console.error("Error analyzing images:", err.message);
  console.error("Error details:", err.response ? err.response.body : err);
});
