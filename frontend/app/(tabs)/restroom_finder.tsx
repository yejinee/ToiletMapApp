/**
 * restroom_finder.tsx
 *
 * 앱의 메인 화면 - 카카오 지도 기반 화장실 탐색 화면
 *
 * 주요 기능:
 *  - GPS로 현재 위치 가져오기
 *  - 카카오 지도 표시 (KakaoMapView 컴포넌트 사용)
 *  - 장소 키워드 검색 → 지도 이동 + 검색 마커 표시
 *  - 마커 클릭 → 하단 미리보기 카드 표시
 *  - 현재 위치로 돌아가기 버튼
 *  - 하단 화장실 목록 시트 (마커 미선택 시 표시)
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

import KakaoMapView from '../../components/KakaoMapView';
import ToiletListSheet from '../../components/ToiletListSheet';
import styles from './restroom_finder.styles';

// ─────────────────────────────────────────────
// 타입 정의 (다른 파일에서 import해서 쓸 수 있도록 export)
// ─────────────────────────────────────────────

/** 카카오 장소 검색 결과 1개의 데이터 구조 */
export interface SearchPlace {
  id: string;       // 카카오 장소 고유 ID
  name: string;     // 장소명
  address: string;  // 도로명 주소
  phone: string;    // 전화번호
  category: string; // 카카오 카테고리 (예: "음식점 > 카페")
  lat: number;      // 위도
  lon: number;      // 경도
}

/** 화장실 편의시설 체크리스트 */
export interface Checklist {
  public: boolean;     // 공용 화장실 여부
  bidet: boolean;      // 비데 있음
  paper: boolean;      // 휴지 있음
  accessible: boolean; // 장애인 이용 가능
}

/** 화장실 리뷰 1개 */
export interface Review {
  id: string;
  author: string;    // 작성자 (익명 처리)
  star: number;      // 별점 (1~5)
  text: string;      // 리뷰 내용
  timestamp: string; // 작성일
}

/** 화장실 데이터 구조 (백엔드 API 응답 기준) */
export interface Toilet {
  id: string;
  name: string;
  address: string;
  coords: { lat: number; lon: number; };
  rating: { average: number; count: number; };
  checklist: Checklist;
  reviews: Review[];
  distance?: number; // 현재 위치와의 거리 (km), 앱에서 계산해서 추가
}

// ─────────────────────────────────────────────
// 임시 테스트 데이터 (나중에 백엔드 API로 교체 예정)
// ─────────────────────────────────────────────
const toilets: Toilet[] = [
  { id: 't1', name: '판교역 공용화장실', address: '경기 성남시 분당구 판교역로 160', coords: { lat: 37.3952, lon: 127.1106 }, rating: { average: 4.0, count: 42 }, checklist: { public: true, bidet: false, paper: true, accessible: true }, reviews: [{ id: 'r1', author: '김**', star: 4, text: '역 안에 있어서 깔끔해요.', timestamp: '2023-01-15' }] },
  { id: 't2', name: '알파돔시티 화장실', address: '경기 성남시 분당구 판교역로 146번길 20', coords: { lat: 37.3965, lon: 127.1118 }, rating: { average: 4.3, count: 88 }, checklist: { public: false, bidet: true, paper: true, accessible: true }, reviews: [{ id: 'r2', author: '박**', star: 5, text: '쇼핑몰이라 넓고 깨끗해요!', timestamp: '2023-01-14' }] },
  { id: 't3', name: '봇들공원 화장실', address: '경기 성남시 분당구 삼평동', coords: { lat: 37.4012, lon: 127.1070 }, rating: { average: 3.5, count: 20 }, checklist: { public: true, bidet: false, paper: true, accessible: false }, reviews: [{ id: 'r3', author: '이**', star: 3, text: '공원 화장실이라 관리 보통이에요.', timestamp: '2023-01-13' }] },
  { id: 't4', name: '카카오 사옥 화장실', address: '경기 성남시 분당구 판교역로 166', coords: { lat: 37.3949, lon: 127.1116 }, rating: { average: 4.8, count: 130 }, checklist: { public: false, bidet: true, paper: true, accessible: true }, reviews: [{ id: 'r4', author: '최**', star: 5, text: '깔끔하고 비데 있어요.', timestamp: '2023-01-12' }] },
  { id: 't5', name: 'DTC타워 화장실', address: '경기 성남시 분당구 판교역로 240', coords: { lat: 37.3978, lon: 127.1098 }, rating: { average: 4.1, count: 55 }, checklist: { public: false, bidet: true, paper: true, accessible: true }, reviews: [{ id: 'r5', author: '정**', star: 4, text: '회사 건물이라 잘 관리돼요.', timestamp: '2023-01-11' }] },
  { id: 't6', name: '판교 스타벅스 화장실', address: '경기 성남시 분당구 판교역로 152', coords: { lat: 37.3960, lon: 127.1090 }, rating: { average: 3.8, count: 70 }, checklist: { public: false, bidet: false, paper: true, accessible: false }, reviews: [{ id: 'r6', author: '윤**', star: 4, text: '카페 화장실치고 깨끗해요.', timestamp: '2023-01-10' }] }
];

// ─────────────────────────────────────────────
// 두 좌표 사이의 거리 계산 (하버사인 공식, 단위: km)
// ─────────────────────────────────────────────
const getDistance = (loc1: { lat: number; lon: number }, loc2: { lat: number; lon: number }) => {
  const R = 6371; // 지구 반지름 (km)
  const toRad = (deg: number) => deg * Math.PI / 180;
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLon = toRad(loc2.lon - loc1.lon);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────
export default function RestroomFinder() {

  // 현재 GPS 위치 (초기값: 강남역 근처)
  const [userLocation, setUserLocation] = useState({ lat: 37.4981, lon: 127.0276 });

  // 거리 계산 후 정렬된 화장실 목록 (하단 리스트에 표시)
  const [toiletList, setToiletList] = useState<Toilet[]>([]);

  // 화면 상단에 잠깐 뜨는 알림 메시지
  const [message, setMessage] = useState('');
  const [isMessageModalVisible, setIsMessageModalVisible] = useState(false);

  // 검색창에 입력 중인 텍스트
  const [searchText, setSearchText] = useState('');

  // 실제로 지도에 전달되는 검색어 (엔터/버튼 눌렀을 때만 반영)
  const [searchKeyword, setSearchKeyword] = useState('');

  // 현재 위치로 돌아가기 버튼을 누를 때마다 1씩 증가 → KakaoMapView가 감지해서 지도 이동
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  // 화장실 마커를 클릭했을 때 선택된 화장실 데이터 (null이면 미선택)
  const [selectedToilet, setSelectedToilet] = useState<Toilet | null>(null);

  // 검색 결과 마커를 클릭했을 때 선택된 장소 데이터 (null이면 미선택)
  const [selectedSearchPlace, setSelectedSearchPlace] = useState<SearchPlace | null>(null);

  // ─── 알림 메시지 표시 (3초 후 자동으로 사라짐) ───
  const showMessage = (msg: string) => {
    setMessage(msg);
    setIsMessageModalVisible(true);
    setTimeout(() => setIsMessageModalVisible(false), 3000);
  };

  // ─── 앱 시작 시 GPS 위치 가져오기 ───
  useEffect(() => {
    // 위치를 받아서 화장실 목록을 거리 기준으로 정렬하는 함수
    const sortToilets = (loc: { lat: number; lon: number }) => {
      const sorted = toilets
        .map(t => ({ ...t, distance: getDistance(loc, t.coords) }))
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setToiletList(sorted);
    };

    if (navigator.geolocation) {
      // GPS 허용된 경우: 실제 위치 사용
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lon: position.coords.longitude };
          setUserLocation(loc);
          sortToilets(loc);
        },
        (error) => {
          // GPS 거부/실패한 경우: 기본값(강남역) 사용
          console.error('GPS 오류:', error);
          showMessage('GPS를 사용할 수 없어 강남역을 기준으로 검색합니다.');
          sortToilets(userLocation);
        }
      );
    } else {
      // 브라우저가 GPS를 지원하지 않는 경우
      sortToilets(userLocation);
    }
  }, []);

  // ─── 화장실 상세 페이지로 이동 ───
  const showDetail = (toilet: Toilet) => {
    router.push({
      pathname: '/(tabs)/restroom_details',
      params: { toilet: JSON.stringify(toilet) },
    });
  };

  // ─── 화장실 마커 클릭 핸들러 ───
  // KakaoMapView에서 toiletId를 올려주면, 해당 화장실을 찾아서 미리보기 카드 표시
  const handleMarkerClick = (toiletId: string) => {
    const toilet = toiletList.find(t => t.id === toiletId);
    if (toilet) {
      setSelectedToilet(toilet);
      setSelectedSearchPlace(null); // 검색 카드는 닫기
    }
  };

  // ─── 검색 결과 마커 클릭 핸들러 ───
  // KakaoMapView에서 SearchPlace 객체를 올려주면 미리보기 카드 표시
  const handleSearchMarkerClick = (place: SearchPlace) => {
    setSelectedSearchPlace(place);
    setSelectedToilet(null); // 화장실 카드는 닫기
  };

  // ─────────────────────────────────────────────
  // 화면 렌더링
  // ─────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* ── 상단 검색바 ── */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="장소, 지역을 검색하세요"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={() => setSearchKeyword(searchText)} // 키보드 엔터 시 검색
          returnKeyType="search"
        />
        {/* 검색 버튼: 누르면 searchKeyword를 업데이트 → KakaoMapView가 감지해서 검색 실행 */}
        <Pressable style={styles.searchButton} onPress={() => setSearchKeyword(searchText)}>
          <FontAwesome name="search" size={20} color="#F1ECE2" />
        </Pressable>
      </View>

      {/* ── 지도 영역 ── */}
      <View style={styles.mapContainer}>
        {/*
          KakaoMapView:
          - toilets: 지도에 표시할 화장실 마커 목록 (현재는 빈 배열 → 마커 없음, 추후 API 연동 시 활성화)
          - userLocation: 현재 GPS 위치 → 지도 중심 + 파란 점 표시
          - onMarkerClick: 화장실 마커 클릭 시 호출
          - onSearchMarkerClick: 검색 결과 마커 클릭 시 호출
          - recenterTrigger: 값이 바뀔 때마다 지도를 현재 위치로 이동
          - searchKeyword: 바뀔 때마다 카카오 장소 검색 실행
          - selectedToiletId: 선택된 화장실 마커를 주황색으로 강조
          - selectedSearchPlaceId: 선택된 검색 마커를 주황색으로 강조
        */}
        <KakaoMapView
          toilets={[]}
          userLocation={userLocation}
          onMarkerClick={handleMarkerClick}
          onSearchMarkerClick={handleSearchMarkerClick}
          recenterTrigger={recenterTrigger}
          searchKeyword={searchKeyword}
          selectedToiletId={selectedToilet?.id}
          selectedSearchPlaceId={selectedSearchPlace?.id}
        />

        {/* 현재 위치로 돌아가기 버튼 (지도 우상단) */}
        <Pressable
          style={styles.recenterButton}
          onPress={() => setRecenterTrigger(v => v + 1)}
        >
          <FontAwesome name="location-arrow" size={20} color="#A0522D" />
        </Pressable>
      </View>

      {/* ── 화장실 마커 클릭 시 미리보기 카드 ── */}
      {selectedToilet && (
        <View style={styles.previewCard}>
          {/* 닫기 버튼 */}
          <Pressable style={styles.previewCardClose} onPress={() => setSelectedToilet(null)}>
            <Ionicons name="close" size={20} color="#D2B48C" />
          </Pressable>

          <Text style={styles.previewCardName}>{selectedToilet.name}</Text>
          <Text style={styles.previewCardAddress}>{selectedToilet.address}</Text>

          {/* 별점 + 평가 수 + 거리 */}
          <View style={styles.previewCardRatingRow}>
            <Text style={styles.previewCardRatingText}>{selectedToilet.rating.average.toFixed(1)}</Text>
            <Text style={styles.previewCardRatingCount}>({selectedToilet.rating.count}명 평가)</Text>
            {selectedToilet.distance && (
              <Text style={styles.previewCardDistance}>{selectedToilet.distance.toFixed(2)} km</Text>
            )}
          </View>

          {/* 편의시설 태그 */}
          <View style={styles.previewCardTags}>
            {selectedToilet.checklist.public && <Text style={styles.checklistTag}>공용</Text>}
            {selectedToilet.checklist.bidet && <Text style={[styles.checklistTag, { backgroundColor: '#A0522D' }]}>비데</Text>}
            {selectedToilet.checklist.paper && <Text style={styles.checklistTag}>휴지</Text>}
            {selectedToilet.checklist.accessible && <Text style={[styles.checklistTag, { backgroundColor: '#D2B48C', color: '#1C1917' }]}>장애인</Text>}
          </View>

          {/* 상세보기 버튼 → restroom_details 페이지로 이동 */}
          <Pressable style={styles.previewCardDetailBtn} onPress={() => showDetail(selectedToilet)}>
            <Text style={styles.previewCardDetailText}>상세보기</Text>
          </Pressable>
        </View>
      )}

      {/* ── 검색 결과 마커 클릭 시 미리보기 카드 ── */}
      {/* 현재는 가데이터 사용, 추후 API 연동 시 실제 데이터로 교체 예정 */}
      {selectedSearchPlace && (
        <View style={styles.previewCard}>
          {/* 닫기 버튼 */}
          <Pressable style={styles.previewCardClose} onPress={() => setSelectedSearchPlace(null)}>
            <Ionicons name="close" size={20} color="#6B7280" />
          </Pressable>

          {/* 장소명 (카카오 검색 결과) */}
          <Text style={styles.previewCardName}>{selectedSearchPlace.name}</Text>

          {/* 주소 (카카오 검색 결과) */}
          <Text style={styles.previewCardAddress}>{selectedSearchPlace.address}</Text>

          {/* 별점 + 평가 수 + 거리 (가데이터 - 추후 API 연동) */}
          <View style={styles.previewCardRatingRow}>
            <Text style={styles.previewCardRatingText}>4.2</Text>
            <Text style={styles.previewCardRatingCount}>(12명 평가)</Text>
            <Text style={styles.previewCardDistance}>0.3 km</Text>
          </View>

          {/* 편의시설 태그 (가데이터 - 추후 API 연동) */}
          <View style={styles.previewCardTags}>
            <Text style={styles.checklistTag}>공용</Text>
            <Text style={[styles.checklistTag, { backgroundColor: '#A0522D' }]}>비데</Text>
            <Text style={styles.checklistTag}>휴지</Text>
          </View>

          {/* 상세보기 버튼 (추후 연동) */}
          <Pressable style={styles.previewCardDetailBtn} onPress={() => {}}>
            <Text style={styles.previewCardDetailText}>상세보기</Text>
          </Pressable>
        </View>
      )}

      {/* ── 하단 화장실 목록 시트 ── */}
      {/* 마커가 선택되지 않은 경우에만 표시 */}
      {!selectedToilet && !selectedSearchPlace && (
        <ToiletListSheet toiletList={toiletList} showDetail={showDetail} />
      )}

      {/* ── GPS 실패 등 알림 메시지 모달 ── */}
      {isMessageModalVisible && (
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
          <View style={styles.messageModalContainer}>
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          </View>
        </BlurView>
      )}

    </View>
  );
}
