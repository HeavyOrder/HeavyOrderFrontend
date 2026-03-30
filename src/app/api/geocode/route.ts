import { NextRequest, NextResponse } from 'next/server';

// 서버에서 카카오 Geocoding API 호출 (브라우저 직접 호출 시 403 발생)
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query');
  if (!query) {
    return NextResponse.json({ error: '주소를 입력해주세요.' }, { status: 400 });
  }

  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`,
    { headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` } }
  );

  const data = await res.json();
  return NextResponse.json(data);
}
