import { NextResponse } from "next/server";
import { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  if ( pathname.startsWith('/auth/signin') || pathname.startsWith('/auth/signup')) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url), { status: 307 });
    } 
    return NextResponse.next();
  }
  
  
  if (!token) return NextResponse.redirect(new URL('/', request.url));

  return NextResponse.next();
}

export const config = {
  matcher: [ '/mercadopago/:path*', '/auth/:path*' ],
}
