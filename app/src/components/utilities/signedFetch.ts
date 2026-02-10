import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Makes a signed fetch request to AWS Lambda Function URL using AWS SigV4
 * This is required when Lambda authType is AWS_IAM
 */
export async function signedFetch(url: string): Promise<Response> {
  try {
    // Get AWS credentials from Amplify Auth (Cognito)
    const session = await fetchAuthSession();
    const credentials = session.credentials;

    if (!credentials) {
      throw new Error('No credentials available. User must be authenticated.');
    }

    // Parse the URL to extract components needed for signing
    const region = extractRegionFromUrl(url);

    // Create the request
    const request = new Request(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Sign the request using AWS SigV4
    const signedRequest = await signRequest(
      request,
      {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
      region,
      'lambda'
    );

    // Execute the signed request
    return await fetch(signedRequest);
  } catch (error) {
    console.error('Error in signedFetch:', error);
    throw error;
  }
}

/**
 * Extract AWS region from Lambda Function URL
 * Format: https://xxxxx.lambda-url.us-east-1.on.aws/
 */
function extractRegionFromUrl(url: string): string {
  const match = url.match(/lambda-url\.([a-z0-9-]+)\.on\.aws/);
  return match ? match[1] : 'us-east-1'; // fallback to us-east-1
}

/**
 * Sign an HTTP request using AWS Signature Version 4
 */
async function signRequest(
  request: Request,
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
  },
  region: string,
  service: string
): Promise<Request> {
  const url = new URL(request.url);
  const dateTime = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = dateTime.slice(0, 8);

  // Create canonical request
  const method = request.method;
  const path = url.pathname || '/';
  const query = url.search.slice(1); // Remove leading '?'
  const headers = new Headers(request.headers);

  // Add required headers
  headers.set('host', url.host);
  headers.set('x-amz-date', dateTime);
  if (credentials.sessionToken) {
    headers.set('x-amz-security-token', credentials.sessionToken);
  }

  // Sort headers
  const sortedHeaders = Array.from(headers.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );
  const signedHeaders = sortedHeaders.map((h) => h[0]).join(';');
  const canonicalHeaders = sortedHeaders.map((h) => `${h[0]}:${h[1]}`).join('\n') + '\n';

  // Hash the payload (empty for GET requests)
  const payloadHash = await sha256('');

  // Build canonical request
  const canonicalRequest = [
    method,
    path,
    query,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${date}/${region}/${service}/aws4_request`;
  const canonicalRequestHash = await sha256(canonicalRequest);
  const stringToSign = [
    algorithm,
    dateTime,
    credentialScope,
    canonicalRequestHash,
  ].join('\n');

  // Calculate signature
  const signature = await calculateSignature(
    credentials.secretAccessKey,
    date,
    region,
    service,
    stringToSign
  );

  // Add authorization header
  const authorizationHeader = [
    `${algorithm} Credential=${credentials.accessKeyId}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`,
  ].join(', ');

  headers.set('Authorization', authorizationHeader);

  // Return new signed request
  return new Request(request.url, {
    method: request.method,
    headers: headers,
    body: request.body,
  });
}

/**
 * Calculate AWS Signature V4 signature
 */
async function calculateSignature(
  secretKey: string,
  date: string,
  region: string,
  service: string,
  stringToSign: string
): Promise<string> {
  const kDate = await hmac(`AWS4${secretKey}`, date);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  const kSigning = await hmac(kService, 'aws4_request');
  const signature = await hmac(kSigning, stringToSign);
  return bufferToHex(signature);
}

/**
 * HMAC-SHA256
 */
async function hmac(
  key: string | ArrayBuffer,
  data: string
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyData = typeof key === 'string' ? encoder.encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
}

/**
 * SHA-256 hash
 */
async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return bufferToHex(buffer);
}

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
