import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

const html = `
<!DOCTYPE html>
<html lang="en">

<head>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>WHOIS Lookup</title>
	<meta name="description" content="WHOIS Lookup - This tool provides domain WHOIS lookup services.">
	<style>
		* {
			font-weight: 400;
			text-align: center;
			vertical-align: middle;
		}

		body,
		html {
			display: grid;
			height: 100%;
			margin: 0;
			font-family: BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-sans;
		}

		main {
			margin: auto;
			white-space: nowrap;
		}

		input {
			line-height: 1.5;
			height: 3em;
			padding: 0 3em 0 .5em;
			text-align: left;
			width: calc(100vw - 2em);
			max-width: 30em;
			border: 2px solid #9595a2;
			outline: 0;
			border-radius: 4px;
		}

		input:hover {
			border-color: #0250bb
		}

		input:focus {
			border-color: transparent;
			box-shadow: 0 0 0 4px rgb(0 96 223 / 30%), 0 0 0 2px #008aea;
		}

		button {
			margin-left: -3.6em;
			background: transparent;
			border: none;
		}

		button svg {
			padding: 4px;
			border-radius: 4px;
		}

		button svg:hover {
			background: #ededf0;
		}

		p {
			text-align: left;
			background: #efeff4;
			max-width: 720px;
			width: 96vw;
			white-space: pre-wrap;
			padding: 1em;
			border-radius: 0.6em;
		}
		
		p:empty {
			background: #fff;
		}
	</style>
</head>

<body>
	<main>
		<h1>WHOIS Lookup</h1>
		<input type="search" name="ip" placeholder="example.com" />
		<button type="submit" title="Search">
			<svg xmlns="http://www.w3.org/2000/ svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
				stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
				class="feather feather-search">
				<circle cx="11" cy="11" r="8"></circle>
				<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
			</svg>
		</button>
		<p class="output"></p>
	</main>
	<script>
    const url = '/whois/request';
		window.addEventListener("DOMContentLoaded", () => {
			let output = document.querySelector('.output');
			let urlParams = new URLSearchParams(window.location.search);
			let domain = urlParams.get('domain') || '';
			if (domain != '') { whois() };
			document.querySelector('input').focus();
			document.querySelector('button').addEventListener('click', whois);
			document.querySelector('input').addEventListener('keyup', (e) => {
				if (e.keyCode === 13) { whois(); }
			});
			function whois() {
				domain = document.querySelector('input').value || domain;
				if (domain.startsWith('http')) {
					try {
						domain = (new URL(domain)).hostname;
					} catch (TypeError) {
						output.innerHTML = "Invalid URL";
						throw new Error(TypeError);
					}
				}
				fetch(url, {method: 'POST', body: new URLSearchParams({btn: 'getWhois', domain: domain})})
					.then(response => response.json())
					.then(data => {
            			output.innerHTML = data.whois;
					})
			}
		});
	</script>
</body>

</html>
`;

async function handler(req: Request, connInfo: ConnInfo): Promise<Response> {
  switch (req.method) {
    case "GET": {
		const addr = connInfo.remoteAddr as Deno.NetAddr;
  		const ip = addr.hostname;
  		console.log(`Visit from ${ip}`);
		return new Response(html, {
			headers: { "content-type": "text/html; charset=utf-8" },
		});
    }

    case "POST": {
		const url = new URL(req.url);
		if(url.pathname == '/whois/request') {
			url.hostname = "whois-webform.markmonitor.com";
			const response =  await fetch(url.href, {
				headers: req.headers,
				method: req.method,
				body: req.body,
			});
			const newResponse = new Response(response.body, response);
			newResponse.headers.delete('content-security-policy');
			newResponse.headers.delete('x-dns-prefetch-control');
			newResponse.headers.delete('x-download-options');
			newResponse.headers.delete('x-permitted-cross-domain-policies');
			newResponse.headers.delete('x-ratelimit-limit');
			newResponse.headers.delete('x-ratelimit-remaining');
			newResponse.headers.delete('x-ratelimit-reset');
			return newResponse;
		}
      	return new Response("No content", { status: 204 });
    }

    default:
      return new Response("Invalid method", { status: 405 });
  }
}

serve(handler);
