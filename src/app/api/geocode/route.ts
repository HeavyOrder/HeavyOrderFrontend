import { NextRequest, NextResponse } from 'next/server';

// 서버에서 카카오 Geocoding API 호출 (브라우저 직접 호출 시 403 발생)
export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('query');
    if (!query) {
      return NextResponse.json({ error: '주소를 입력해주세요.' }, { status: 400 });
    }

    const apiKey = process.env.KAKAO_REST_API_KEY;
    if (!apiKey) {
      console.error('[geocode] KAKAO_REST_API_KEY 누락 — .env.local 확인 후 dev 서버 재시작 필요');
      return NextResponse.json(
        { error: 'KAKAO_REST_API_KEY 환경변수가 설정되어 있지 않습니다. 서버를 재시작해주세요.' },
        { status: 500 }
      );
    }

    // 1차: 주소 검색 API
    const addrRes = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`,
      { headers: { Authorization: `KakaoAK ${apiKey}` } }
    );
    const addrText = await addrRes.text();
    if (!addrRes.ok) {
      console.error(`[geocode] 주소 검색 실패 ${addrRes.status}: ${addrText}`);
      return NextResponse.json(
        { error: '카카오 주소 검색 실패', detail: addrText },
        { status: addrRes.status }
      );
    }
    const addrData = JSON.parse(addrText);
    if (addrData.documents?.length > 0) {
      return NextResponse.json(addrData);
    }

    // 2차: 주소 검색 결과 없을 경우 키워드 검색 폴백 (건물명/신축 주소 등)
    const kwRes = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`,
      { headers: { Authorization: `KakaoAK ${apiKey}` } }
    );
    if (!kwRes.ok) {
      return NextResponse.json(addrData);
    }
    const kwData = await kwRes.json();
    return NextResponse.json(kwData);
  } catch (err) {
    console.error('[geocode] 예상치 못한 예외:', err);
    return NextResponse.json(
      { error: 'Geocoding 처리 중 오류가 발생했습니다.', detail: String(err) },
      { status: 500 }
    );
  }
}
