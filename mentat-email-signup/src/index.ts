/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// worker.js
export interface Env {
	MENTAT_EMAIL_LIST: KVNamespace;
  }
  
  export default {
	async fetch(request: Request, env: Env) {
	  // Handle CORS
	  if (request.method === "OPTIONS") {
		return new Response(null, {
		  headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST",
			"Access-Control-Allow-Headers": "Content-Type",
		  },
		});
	  }
  
	  if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	  }
  
	  try {
		const body = await request.json() as { email: string };
		const { email } = body;
  
		// Basic email validation
		if (!email || !email.includes("@")) {
		  return new Response(
			JSON.stringify({ error: "Invalid email format" }),
			{
			  status: 400,
			  headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			  },
			}
		  );
		}
  
		// Store in KV
		await env.MENTAT_EMAIL_LIST.put(
		  email,
		  JSON.stringify({
			timestamp: new Date().toISOString(),
			email,
		  })
		);
  
		return new Response(
		  JSON.stringify({ message: "Subscription successful" }),
		  {
			headers: {
			  "Content-Type": "application/json",
			  "Access-Control-Allow-Origin": "*",
			},
		  }
		);
	  } catch (error) {
		return new Response(
		  JSON.stringify({ error: "Server error" }),
		  {
			status: 500,
			headers: {
			  "Content-Type": "application/json",
			  "Access-Control-Allow-Origin": "*",
			},
		  }
		);
	  }
	},
  }