/**
 * API routes setup
 * 
 * This file sets up simulated API routes that would normally be server endpoints.
 * In a real application, these would be actual server routes.
 */

import { useEffect } from 'react';
import { syncData, SyncData } from './sync';

/**
 * API Router Component
 * 
 * This component simulates API route handling in a client-side environment
 * It intercepts fetch requests to specific paths and handles them
 */
export function APIRouter() {
  useEffect(() => {
    // Save the original fetch
    const originalFetch = window.fetch;
    
    // Override fetch to intercept API calls
    window.fetch = async (input, init) => {
      // Handle only string URLs
      if (typeof input !== 'string') {
        return originalFetch(input, init);
      }
      
      // Parse the URL
      const url = new URL(input, window.location.origin);
      const path = url.pathname;
      
      // Handle API endpoints
      if (path === '/api/sync') {
        return handleSyncEndpoint(init);
      }
      
      // For all other requests, use the original fetch
      return originalFetch(input, init);
    };
    
    // Cleanup: restore original fetch when component unmounts
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
  
  return null;
}

/**
 * Handle /api/sync endpoint
 */
async function handleSyncEndpoint(init?: RequestInit) {
  try {
    // Parse the request body
    const body = init?.body ? JSON.parse(init.body.toString()) : {};
    
    // Call the sync function
    const result = await syncData(body as SyncData);
    
    // Return a simulated successful response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // Return a simulated error response
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}