/**
 * KakaoMapView.web.tsx
 *
 * 웹 브라우저 전용 카카오 지도 컴포넌트
 * (모바일에서는 KakaoMapView.tsx 사용 - expo 플랫폼 자동 분기)
 *
 * 주요 기능:
 *  1. 카카오 지도 SDK 로드 및 지도 초기화
 *  2. 현재 위치(userLocation) 변경 시 지도 중심 이동 + 파란 점 표시
 *  3. recenterTrigger 변경 시 현재 위치로 지도 이동
 *  4. searchKeyword 변경 시 카카오 장소 검색 → 검색 마커 표시
 *  5. toilets 배열 변경 시 화장실 마커 표시
 *  6. selectedToiletId 변경 시 해당 화장실 마커를 주황색으로 강조
 *  7. selectedSearchPlaceId 변경 시 해당 검색 마커를 주황색으로 강조
 */

import React, { useEffect, useRef } from 'react';
import { Toilet } from '../app/(tabs)/restroom_finder';

// 카카오 지도 JS API 키 (환경변수에서 불러옴 - .env 파일에 EXPO_PUBLIC_KAKAO_MAP_JS_KEY 설정)
const KAKAO_MAP_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_MAP_JS_KEY;

// 기본 마커 아이콘 (파란색 물방울 모양 SVG)
const DEFAULT_MARKER_SVG = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="35" viewBox="0 0 24 35">
  <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 23 12 23S24 21 24 12C24 5.373 18.627 0 12 0z" fill="#4A90E2"/>
  <circle cx="12" cy="12" r="5" fill="white"/>
</svg>`);

// 선택된 마커 아이콘 (주황색 물방울 모양 SVG, 더 크게)
const SELECTED_MARKER_SVG = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="46" viewBox="0 0 32 46">
  <path d="M16 0C7.164 0 0 7.164 0 16c0 12 16 30 16 30S32 28 32 16C32 7.164 24.836 0 16 0z" fill="#FF6B00"/>
  <circle cx="16" cy="16" r="7" fill="white"/>
</svg>`);

/** 카카오 장소 검색 결과 1개의 데이터 구조 */
export interface SearchPlace {
  id: string;       // 카카오 장소 고유 ID
  name: string;     // 장소명
  address: string;  // 도로명 주소
  phone: string;    // 전화번호
  category: string; // 카카오 카테고리
  lat: number;      // 위도
  lon: number;      // 경도
}

/** KakaoMapView가 부모 컴포넌트로부터 받는 props 타입 */
interface KakaoMapViewProps {
  toilets: Toilet[];                                 // 지도에 표시할 화장실 목록
  userLocation: { lat: number; lon: number };        // 현재 GPS 위치
  onMarkerClick: (toiletId: string) => void;         // 화장실 마커 클릭 콜백
  onSearchMarkerClick: (place: SearchPlace) => void; // 검색 마커 클릭 콜백
  recenterTrigger: number;                           // 값 변경 시 현재 위치로 지도 이동
  searchKeyword: string;                             // 검색어 (변경 시 카카오 장소 검색 실행)
  selectedToiletId?: string | null;                  // 강조할 화장실 마커 ID
  selectedSearchPlaceId?: string | null;             // 강조할 검색 마커 ID
}

// window.kakao 타입 선언 (TypeScript에서 전역 kakao 객체 사용하기 위함)
declare global {
  interface Window { kakao: any; }
}

const KakaoMapView: React.FC<KakaoMapViewProps> = ({
  toilets, userLocation, onMarkerClick, onSearchMarkerClick,
  recenterTrigger, searchKeyword, selectedToiletId, selectedSearchPlaceId
}) => {
  // 지도를 렌더링할 DOM 요소 참조
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // 카카오 지도 인스턴스 (kakao.maps.Map 객체)
  const mapRef = useRef<any>(null);

  // 화장실 마커 저장소: toiletId → kakao.maps.Marker
  const markerMapRef = useRef<Map<string, any>>(new Map());

  // 검색 결과 마커 저장소: placeId → { marker, place }
  const searchMarkerMapRef = useRef<Map<string, { marker: any; place: SearchPlace }>>(new Map());

  // 현재 위치 파란 점 오버레이 (CustomOverlay 인스턴스)
  const myLocationOverlayRef = useRef<any>(null);

  // userLocation의 최신값을 ref로도 보관 (recenter 이펙트에서 클로저 문제 방지)
  const userLocationRef = useRef(userLocation);
  useEffect(() => { userLocationRef.current = userLocation; }, [userLocation]);

  // ── 1. 카카오 지도 SDK 스크립트 로드 및 지도 초기화 ──
  // 컴포넌트 마운트 시 1회만 실행
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_JS_KEY}&libraries=services&autoload=false`;
    script.onerror = (e) => console.error('[KakaoMapView.web] 스크립트 로드 실패:', e);
    script.onload = () => {
      // SDK 로드 완료 후 지도 생성
      window.kakao.maps.load(() => {
        const container = mapContainerRef.current;
        if (!container) return;
        mapRef.current = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lon),
          level: 4, // 확대 레벨 (숫자가 클수록 더 넓은 범위)
        });
      });
    };
    document.head.appendChild(script);

    // 컴포넌트 언마운트 시 스크립트 제거
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  // ── 2. GPS 위치 변경 시 지도 중심 이동 + 파란 점 갱신 ──
  useEffect(() => {
    if (!mapRef.current) return;
    const position = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lon);

    // 지도 중심 이동
    mapRef.current.setCenter(position);

    // 기존 파란 점 제거
    if (myLocationOverlayRef.current) myLocationOverlayRef.current.setMap(null);

    // 새 파란 점 생성 (CSS로 원형 + 파란색 + 테두리 + 흐린 후광 효과)
    const dotEl = document.createElement('div');
    dotEl.innerHTML = `<div style="width:20px;height:20px;background:#4A90E2;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(74,144,226,0.3);"></div>`;
    myLocationOverlayRef.current = new window.kakao.maps.CustomOverlay({ position, content: dotEl, zIndex: 10 });
    myLocationOverlayRef.current.setMap(mapRef.current);
  }, [userLocation]);

  // ── 3. 현재 위치로 돌아가기 버튼 처리 ──
  // recenterTrigger가 0이 아닌 값으로 바뀔 때마다 지도를 현재 위치로 이동
  useEffect(() => {
    if (!mapRef.current || recenterTrigger === 0) return;
    mapRef.current.setCenter(
      new window.kakao.maps.LatLng(userLocationRef.current.lat, userLocationRef.current.lon)
    );
  }, [recenterTrigger]);

  // ── 4. 장소 키워드 검색 ──
  // searchKeyword가 변경될 때마다 카카오 장소 검색 API 호출
  useEffect(() => {
    if (!mapRef.current || !searchKeyword) return;

    // 기존 검색 마커 전부 제거
    searchMarkerMapRef.current.forEach(({ marker }) => marker.setMap(null));
    searchMarkerMapRef.current.clear();

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, (data: any[], status: string) => {
      if (status !== window.kakao.maps.services.Status.OK) return;

      const bounds = new window.kakao.maps.LatLngBounds();

      data.forEach((place) => {
        const position = new window.kakao.maps.LatLng(place.y, place.x);

        // 기본 카카오 마커 생성
        const marker = new window.kakao.maps.Marker({
          map: mapRef.current,
          position,
          title: place.place_name,
        });

        // 마커에 연결할 장소 데이터
        const placeData: SearchPlace = {
          id: place.id,
          name: place.place_name,
          address: place.road_address_name || place.address_name,
          phone: place.phone,
          category: place.category_name,
          lat: parseFloat(place.y),
          lon: parseFloat(place.x),
        };

        // 마커 클릭 이벤트 → 부모 컴포넌트로 장소 데이터 전달
        window.kakao.maps.event.addListener(marker, 'click', () => {
          onSearchMarkerClick(placeData);
        });

        searchMarkerMapRef.current.set(place.id, { marker, place: placeData });
        bounds.extend(position);
      });

      // 모든 검색 결과가 보이도록 지도 영역 자동 조절
      mapRef.current.setBounds(bounds);
    });
  }, [searchKeyword]);

  // ── 5. 화장실 마커 갱신 ──
  // toilets 배열이 바뀔 때마다 기존 마커 제거 후 새로 생성
  useEffect(() => {
    if (!mapRef.current || toilets.length === 0) return;

    // 기존 마커 전부 제거
    markerMapRef.current.forEach(m => m.setMap(null));
    markerMapRef.current.clear();

    const defaultImage = new window.kakao.maps.MarkerImage(
      `data:image/svg+xml;charset=utf-8,${DEFAULT_MARKER_SVG}`,
      new window.kakao.maps.Size(24, 35)
    );

    toilets.forEach((toilet) => {
      const position = new window.kakao.maps.LatLng(toilet.coords.lat, toilet.coords.lon);
      const marker = new window.kakao.maps.Marker({
        map: mapRef.current,
        position,
        title: toilet.name,
        image: defaultImage,
      });

      // 마커 클릭 이벤트 → 부모 컴포넌트로 toiletId 전달
      window.kakao.maps.event.addListener(marker, 'click', () => onMarkerClick(toilet.id));
      markerMapRef.current.set(toilet.id, marker);
    });
  }, [toilets]);

  // ── 6. 화장실 마커 하이라이트 ──
  // selectedToiletId가 바뀔 때마다 해당 마커만 주황색(크게), 나머지는 파란색(기본)으로
  useEffect(() => {
    if (!mapRef.current) return;
    const defaultImage = new window.kakao.maps.MarkerImage(
      `data:image/svg+xml;charset=utf-8,${DEFAULT_MARKER_SVG}`,
      new window.kakao.maps.Size(24, 35)
    );
    const selectedImage = new window.kakao.maps.MarkerImage(
      `data:image/svg+xml;charset=utf-8,${SELECTED_MARKER_SVG}`,
      new window.kakao.maps.Size(32, 46),
      { offset: new window.kakao.maps.Point(16, 46) }
    );
    markerMapRef.current.forEach((marker, id) => {
      marker.setImage(id === selectedToiletId ? selectedImage : defaultImage);
      marker.setZIndex(id === selectedToiletId ? 5 : 1);
    });
  }, [selectedToiletId]);

  // ── 7. 검색 마커 하이라이트 ──
  // selectedSearchPlaceId가 바뀔 때마다 해당 마커만 주황색(크게), 나머지는 기본 마커로
  useEffect(() => {
    if (!mapRef.current) return;
    const selectedImage = new window.kakao.maps.MarkerImage(
      `data:image/svg+xml;charset=utf-8,${SELECTED_MARKER_SVG}`,
      new window.kakao.maps.Size(32, 46),
      { offset: new window.kakao.maps.Point(16, 46) }
    );
    searchMarkerMapRef.current.forEach(({ marker }, id) => {
      if (id === selectedSearchPlaceId) {
        marker.setImage(selectedImage);
        marker.setZIndex(5);
      } else {
        marker.setImage(null); // null = 카카오 기본 마커로 복원
        marker.setZIndex(1);
      }
    });
  }, [selectedSearchPlaceId]);

  // 지도를 꽉 채우는 div (position: absolute로 부모 View를 꽉 채움)
  return <div ref={mapContainerRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />;
};

export default KakaoMapView;
