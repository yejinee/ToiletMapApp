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

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import axios from 'axios';

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
  distance?: string; // REST API 응답 거리 (미터, 문자열)
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

// 더미 화장실 데이터 제거됨 — 백엔드 API 연동 후 실제 데이터로 교체 예정

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────
export default function RestroomFinder() {

  // 현재 GPS 위치 (초기값: 강남역 근처)
  const [userLocation, setUserLocation] = useState({ lat: 37.4981, lon: 127.0276 });
  // 검색 시 최신 위치를 참조하기 위한 ref (useEffect dependency 없이 최신값 유지)
  const userLocationRef = useRef({ lat: 37.4981, lon: 127.0276 });

  // 화장실 목록 — 백엔드 API 연동 전까지 빈 배열
  const [toiletList] = useState<Toilet[]>([]);

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

  // 카카오 카테고리 검색으로 받은 근처 장소 목록 (음식점/카페)
  const [nearbyPlaces, setNearbyPlaces] = useState<SearchPlace[]>([]);

  // 키워드 검색 결과 목록 (지도 마커 + 미리보기 카드)
  const [searchResults, setSearchResults] = useState<SearchPlace[]>([]);

  // ─── 카카오 REST API로 근처 장소 검색 (음식점 + 카페) ───
  const fetchNearbyPlaces = async (loc: { lat: number; lon: number }) => {
    const REST_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_KEY;
    const headers = { Authorization: `KakaoAK ${REST_KEY}` };
    const params = { x: loc.lon, y: loc.lat, radius: 300, size: 15 };
    try {
      const [fd6, ce7] = await Promise.all([
        axios.get('https://dapi.kakao.com/v2/local/search/category.json', { headers, params: { ...params, category_group_code: 'FD6' } }),
        axios.get('https://dapi.kakao.com/v2/local/search/category.json', { headers, params: { ...params, category_group_code: 'CE7' } }),
      ]);
      const toPlace = (item: any): SearchPlace => ({
        id: item.id,
        name: item.place_name,
        address: item.road_address_name || item.address_name,
        phone: item.phone,
        category: item.category_name,
        lat: parseFloat(item.y),
        lon: parseFloat(item.x),
        distance: item.distance,
      });
      const all = [
        ...(fd6.data.documents || []).map(toPlace),
        ...(ce7.data.documents || []).map(toPlace),
      ].sort((a: any, b: any) => parseInt(a.distance || '0') - parseInt(b.distance || '0'));
      console.log('[nearbyPlaces] REST API 결과:', all.length);
      setNearbyPlaces(all);
    } catch (e) {
      console.error('[nearbyPlaces] REST API 오류:', e);
    }
  };

  // searchKeyword가 바뀔 때마다 카카오 키워드 검색 실행
  useEffect(() => {
    if (!searchKeyword.trim()) {
      setSearchResults([]);
      return;
    }
    const REST_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_KEY;
    const headers = { Authorization: `KakaoAK ${REST_KEY}` };
    setSelectedSearchPlace(null);
    setSelectedToilet(null);
    axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
      headers,
      params: { query: searchKeyword, x: userLocationRef.current.lon, y: userLocationRef.current.lat, size: 15 },
    }).then(res => {
      const toPlace = (item: any): SearchPlace => ({
        id: item.id,
        name: item.place_name,
        address: item.road_address_name || item.address_name,
        phone: item.phone,
        category: item.category_name,
        lat: parseFloat(item.y),
        lon: parseFloat(item.x),
        distance: item.distance,
      });
      setSearchResults((res.data.documents || []).map(toPlace));
    }).catch(e => console.error('[search] REST API 오류:', e));
  }, [searchKeyword]);

  // ─── 알림 메시지 표시 (3초 후 자동으로 사라짐) ───
  const showMessage = (msg: string) => {
    setMessage(msg);
    setIsMessageModalVisible(true);
    setTimeout(() => setIsMessageModalVisible(false), 3000);
  };

  // debounce 타이머 ref — 지도 이동 시 연속 API 호출 방지
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 지도 중심이 바뀔 때마다 호출 (idle 이벤트) → 800ms debounce 후 재검색
  const handleMapCenterChange = useCallback((loc: { lat: number; lon: number }) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchNearbyPlaces(loc);
    }, 800);
  }, []);

  // ─── 앱 시작 시 GPS 위치 가져오기 ───
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showMessage('GPS를 사용할 수 없어 강남역을 기준으로 검색합니다.');
        fetchNearbyPlaces(userLocation);
        return;
      }
      try {
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const loc = { lat: position.coords.latitude, lon: position.coords.longitude };
        setUserLocation(loc);
        userLocationRef.current = loc;
        fetchNearbyPlaces(loc);
      } catch (error) {
        console.error('GPS 오류:', error);
        showMessage('GPS를 사용할 수 없어 강남역을 기준으로 검색합니다.');
        fetchNearbyPlaces(userLocation);
      }
    })();
  }, []);

  // ─── 근처 장소 상세 페이지로 이동 ───
  const showPlaceDetail = (place: SearchPlace) => {
    router.push({
      pathname: '/(tabs)/restroom_details',
      params: { place: JSON.stringify(place) },
    });
  };

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
          toilets={toiletList}
          userLocation={userLocation}
          onMarkerClick={handleMarkerClick}
          onSearchMarkerClick={handleSearchMarkerClick}
          onMapCenterChange={handleMapCenterChange}
          nearbyPlaces={nearbyPlaces}
          searchResults={searchResults}
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

      {/* ── 근처 장소 마커 클릭 시 미리보기 카드 ── */}
      {selectedSearchPlace && (
        <View style={styles.previewCard}>
          <Pressable style={styles.previewCardClose} onPress={() => setSelectedSearchPlace(null)}>
            <Ionicons name="close" size={20} color="#D2B48C" />
          </Pressable>

          <Text style={styles.previewCardName}>{selectedSearchPlace.name}</Text>
          <Text style={styles.previewCardAddress}>{selectedSearchPlace.address}</Text>

          <View style={styles.previewCardRatingRow}>
            <Text style={styles.previewCardRatingText}>0.0</Text>
            <Text style={styles.previewCardRatingCount}>(평가 없음)</Text>
            {selectedSearchPlace.distance && (
              <Text style={styles.previewCardDistance}>
                {parseInt(selectedSearchPlace.distance) >= 1000
                  ? `${(parseInt(selectedSearchPlace.distance) / 1000).toFixed(1)} km`
                  : `${selectedSearchPlace.distance} m`}
              </Text>
            )}
          </View>

          {/* 카테고리 태그 */}
          <View style={styles.previewCardTags}>
            <Text style={styles.checklistTag}>
              {selectedSearchPlace.category.split(' > ')[1] || selectedSearchPlace.category.split(' > ')[0]}
            </Text>
          </View>

          <Pressable style={styles.previewCardDetailBtn} onPress={() => showPlaceDetail(selectedSearchPlace)}>
            <Text style={styles.previewCardDetailText}>상세보기</Text>
          </Pressable>
        </View>
      )}

      {/* ── 검색 결과 목록 시트 (검색어 있을 때) ── */}
      {searchResults.length > 0 && !selectedSearchPlace && !selectedToilet && (
        <View style={styles.searchResultSheet}>
          <View style={styles.searchResultHeader}>
            <Text style={styles.searchResultTitle}>검색 결과 {searchResults.length}개</Text>
            <Pressable onPress={() => { setSearchResults([]); setSearchText(''); setSearchKeyword(''); }}>
              <Ionicons name="close" size={20} color="#D2B48C" />
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.searchResultScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {searchResults.map(place => (
              <Pressable key={place.id} style={styles.searchResultCard} onPress={() => setSelectedSearchPlace(place)}>
                <Text style={styles.searchResultName} numberOfLines={1}>{place.name}</Text>
                <Text style={styles.searchResultAddress} numberOfLines={1}>{place.address}</Text>
                <View style={styles.searchResultRow}>
                  {place.category ? (
                    <Text style={styles.searchResultCategory}>
                      {place.category.split(' > ')[1] || place.category.split(' > ')[0]}
                    </Text>
                  ) : null}
                  {place.distance ? (
                    <Text style={styles.searchResultDistance}>
                      {parseInt(place.distance) >= 1000
                        ? `${(parseInt(place.distance) / 1000).toFixed(1)} km`
                        : `${place.distance} m`}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── 하단 화장실 목록 시트 (검색 결과 없을 때) ── */}
      {searchResults.length === 0 && !selectedToilet && !selectedSearchPlace && (
        <ToiletListSheet toiletList={toiletList} showDetail={showDetail} showPlaceDetail={showPlaceDetail} nearbyPlaces={nearbyPlaces} />
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
