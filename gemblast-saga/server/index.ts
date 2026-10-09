import assets from 'virtual:gemblast-assets';
import { leagueAPI } from './league';
import type { LeagueDB } from './database';

// Embedded assets are base64 text; decode each one once per isolate, not per request.
const decoded = new Map<string, Uint8Array<ArrayBuffer>>();
const bytesFor = (path: string, body: string): Uint8Array<ArrayBuffer> => {
  let bytes = decoded.get(path);
  if (!bytes) { bytes = Uint8Array.from(atob(body), c => c.charCodeAt(0)); decoded.set(path, bytes); }
  return bytes;
};

export default {
  async fetch(request: Request, env: {DB:LeagueDB}) {
    const path = new URL(request.url).pathname;
    if (path.startsWith('/api/league/')) return leagueAPI(request,env.DB);
    if (request.method!=='GET' && request.method!=='HEAD') return new Response('Method not allowed',{status:405});
    const key=path==='/'?'/index.html':path, asset=assets[key];
    if (!asset) return new Response('Not found',{status:404});
    const headers={'content-type':asset.mime,'etag':asset.etag,'x-content-type-options':'nosniff','cache-control':path.startsWith('/assets/')?'public,max-age=31536000,immutable':path.startsWith('/cores/')?'public,max-age=86400':'no-cache'};
    if (request.headers.get('if-none-match')===asset.etag) return new Response(null,{status:304,headers});
    return new Response(request.method==='HEAD'?null:bytesFor(key,asset.body),{headers});
  },
};
