import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Nodely API configuration - Using server-side environment variables
const ALGOD_TOKEN = process.env.ALGOD_TOKEN || '';
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || 'mainnet';

// Nodely endpoints - CORRECTED WITH 4160 SUBDOMAIN
const MAINNET_ALGOD_SERVER = 'https://mainnet-api.4160.nodely.io';
const TESTNET_ALGOD_SERVER = 'https://testnet-api.4160.nodely.io';

const ALGOD_SERVER = ENVIRONMENT === 'mainnet' ? MAINNET_ALGOD_SERVER : TESTNET_ALGOD_SERVER;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    if (!ALGOD_TOKEN) {
      console.error('ALGOD_TOKEN environment variable is not set');
      return NextResponse.json(
        { error: 'API configuration error: ALGOD_TOKEN not configured' },
        { status: 500 }
      );
    }

    // Validate Algorand address format
    if (address.length !== 58) {
      return NextResponse.json(
        { error: 'Invalid Algorand address format' },
        { status: 400 }
      );
    }

    console.log(`Fetching account info for ${address} from ${ENVIRONMENT} via Nodely API (4160 endpoint)`);

    // Make request to Nodely API - CORRECTED AUTH HEADER
    const response = await fetch(`${ALGOD_SERVER}/v2/accounts/${address}`, {
      method: 'GET',
      headers: {
        'X-Algo-Api-Token': ALGOD_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Nodely API error: ${response.status} ${response.statusText}`);
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key or authentication failed' },
          { status: 401 }
        );
      } else if (response.status === 404) {
        return NextResponse.json(
          { error: 'Account not found on the network' },
          { status: 404 }
        );
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: `Nodely API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const accountData = await response.json();
    
    console.log(`✅ Successfully fetched account data for ${address} on ${ENVIRONMENT}`);
    
    return NextResponse.json(accountData);
  } catch (error: any) {
    console.error('Error in Nodely API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}