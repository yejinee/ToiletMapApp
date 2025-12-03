import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Image, TextInput } from 'react-native';
import ToiletListSheet from '../../components/ToiletListSheet';
import { BlurView } from 'expo-blur';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
// 💡 새로 생성한 KakaoMapView 컴포넌트 Import
import KakaoMapView from '../../components/KakaoMapView';

export interface Checklist {
  public: boolean;
  bidet: boolean;
  paper: boolean;
  accessible: boolean;
}

export interface Review {
  id: string;
  author: string;
  star: number;
  text: string;
  timestamp: string;
}

export interface Toilet {
  id: string;
  name: string;
  address: string;
  coords: { lat: number; lon: number; };
  rating: { average: number; count: number; };
  checklist: Checklist;
  reviews: Review[];
  distance?: number;
}

const toilets: Toilet[] = [
  { id: 't1', name: '스타벅스 강남역점', address: '서울 강남구 강남대로 390', coords: { lat: 37.4981, lon: 127.0276 }, rating: { average: 4.5, count: 25 }, checklist: { public: false, bidet: true, paper: true, accessible: true }, reviews: [{ id: 'r1', author: '김**', star: 5, text: '깨끗하고 비데도 있어서 좋았어요!', timestamp: '2023-01-15' }, { id: 'r2', author: '박**', star: 4, text: '휴지가 없어서 아쉬웠지만 괜찮았습니다.', timestamp: '2023-01-14' }] },
  { id: 't2', name: '강남역 2호선 공용화장실', address: '서울 강남구 강남역', coords: { lat: 37.4975, lon: 127.0278 }, rating: { average: 3.8, count: 110 }, checklist: { public: true, bidet: false, paper: true, accessible: true }, reviews: [{ id: 'r3', author: '이**', star: 3, text: '사람이 많아서 조금 혼잡했어요.', timestamp: '2023-01-16' }, { id: 'r4', author: '최**', star: 4, text: '위치가 좋고 깔끔합니다.', timestamp: '2023-01-13' }] },
  { id: 't3', name: '카카오프렌즈샵 강남', address: '서울 강남구 강남대로 429', coords: { lat: 37.5002, lon: 127.0267 }, rating: { average: 4.2, count: 58 }, checklist: { public: false, bidet: true, paper: true, accessible: false }, reviews: [{ id: 'r5', author: '정**', star: 5, text: '너무 귀엽고 깨끗해요! 비데도 있어서 최고!', timestamp: '2023-01-17' }] },
  { id: 't4', name: '국기원 화장실', address: '서울 강남구 역삼1동 635', coords: { lat: 37.4988, lon: 127.0371 }, rating: { average: 3.1, count: 15 }, checklist: { public: true, bidet: false, paper: false, accessible: true }, reviews: [{ id: 'r6', author: '김**', star: 2, text: '관리가 잘 안되는 것 같아요..', timestamp: '2023-01-10' }] },
  { id: 't5', name: '메가박스 코엑스', address: '서울 강남구 영동대로 513', coords: { lat: 37.5118, lon: 127.0592 }, rating: { average: 4.8, count: 205 }, checklist: { public: false, bidet: true, paper: true, accessible: true }, reviews: [{ id: 'r7', author: '윤**', star: 5, text: '영화관 화장실이라 역시 깨끗하고 넓어요.', timestamp: '2023-01-18' }] },
  { id: 't6', name: '올리브영 신논현역점', address: '서울 서초구 강남대로 475', coords: { lat: 37.5050, lon: 127.0245 }, rating: { average: 4.0, count: 70 }, checklist: { public: false, bidet: false, paper: true, accessible: false }, reviews: [{ id: 'r8', author: '박**', star: 4, text: '깔끔하고 휴지도 많았습니다.', timestamp: '2023-01-15' }] }
];

const getDistance = (loc1: { lat: number; lon: number; }, loc2: { lat: number; lon: number; }) => {
  const R = 6371;
  const toRad = (deg: number) => deg * Math.PI / 180;
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLon = toRad(loc2.lon - loc1.lon);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function RestroomFinder() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number; }>({ lat: 37.4981, lon: 127.0276 });
  const [toiletList, setToiletList] = useState<Toilet[]>([]);
  const [message, setMessage] = useState<string>('');
  const [isMessageModalVisible, setIsMessageModalVisible] = useState<boolean>(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setIsMessageModalVisible(true);
    setTimeout(() => {
      setIsMessageModalVisible(false);
    }, 3000);
  };

  // useEffect(() => {
  //   try {
  //     const sortedToilets: Toilet[] = toilets
  //       .map(t => ({ ...t, distance: getDistance(userLocation, t.coords) }))
  //       .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  //     setToiletList(sortedToilets);
  //   } catch (error) {
  //     console.error("GPS 오류:", error);
  //     showMessage("GPS를 사용할 수 없어 강남역을 기준으로 검색합니다.");
  //     const sortedToilets: Toilet[] = toilets
  //       .map(t => ({ ...t, distance: getDistance(userLocation, t.coords) }))
  //       .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  //     setToiletList(sortedToilets);
  //   }
  //   setIsAuthReady(true);
  //   setCurrentUserId('mock-user-id');
  // }, []);

  useEffect(() => {
    try {
      const sortedToilets: Toilet[] = toilets
        .map(t => ({ ...t, distance: getDistance(userLocation, t.coords) }))
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setToiletList(sortedToilets);
    } catch (error) {
      console.error("GPS 오류:", error);
      showMessage("GPS를 사용할 수 없어 강남역을 기준으로 검색합니다.");
      const sortedToilets: Toilet[] = toilets
        .map(t => ({ ...t, distance: getDistance(userLocation, t.coords) }))
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setToiletList(sortedToilets);
    }
    setIsAuthReady(true);
    setCurrentUserId('mock-user-id');
  }, []);
  
  const showDetail = (toilet: Toilet) => {
    router.push({
      pathname: "/(tabs)/restroom_details",
      params: { toilet: JSON.stringify(toilet) }
    });
  };
  
// 💡 KakaoMapView의 onMarkerClick 이벤트 핸들러
  const handleMarkerClick = (toiletId: string) => {
    const selectedToilet = toiletList.find(t => t.id === toiletId);
    if (selectedToilet) {
      showDetail(selectedToilet);
    }
  };

  // const showDetail = (toilet: Toilet) => {
  //   router.push({
  //     pathname: "/(tabs)/restroom_details",
  //     params: { toilet: JSON.stringify(toilet) }
  //   });
  // };


  /*
   <View style={styles.mapContainer}>
        <Image
          source={{ uri: 'https://placehold.co/600x400/E2E8F0/94A3B8?text=Map+of+Gangnam' }}
          style={styles.mapImage}
        />
        <View style={styles.userIdContainer}>
          <Text style={styles.userIdText}>사용자 ID: {currentUserId || '로그인 중...'}</Text>
        </View>
      </View>
  */

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="장소, 지역을 검색하세요"
        />
        <Pressable style={styles.searchButton}>
          <FontAwesome name="map-marker" size={24} color="#6B7280" />
        </Pressable>
      </View>

    <View style={styles.mapContainer}>
        {/* 💡 KakaoMapView 컴포넌트로 대체 */}
        {
        // toiletList.length > 0 && (
          <KakaoMapView 
            toilets={toiletList} 
            userLocation={userLocation} 
            onMarkerClick={handleMarkerClick} 
          />
        // )
        }
        
        <View style={styles.userIdContainer}>
          <Text style={styles.userIdText}>사용자 ID: {currentUserId || '로그인 중...'}</Text>
        </View>
      </View>

      <ToiletListSheet toiletList={toiletList} showDetail={showDetail} />

      {/* Message Modal (replaces alert()) */}
      {isMessageModalVisible && (
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
          <View style={styles.messageModalContainer}>
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          </View>
        </BlurView>
      )}
      
      {/* Tab Bar (주석처리 요청) */}
      {/*
      <View style={styles.tabBar}>
        <Pressable style={styles.tabBarItem}>
          <Ionicons name="home" size={24} color="#FF8C00" />
          <Text style={styles.tabBarLabel}>홈</Text>
        </Pressable>
        <Pressable style={styles.tabBarItem}>
          <FontAwesome name="pencil" size={24} color="#6B7280" />
          <Text style={styles.tabBarLabel}>리뷰쓰기</Text>
        </Pressable>
        <Pressable style={styles.tabBarItem}>
          <Ionicons name="person-circle" size={24} color="#6B7280" />
          <Text style={styles.tabBarLabel}>마이페이지</Text>
        </Pressable>
      </View>
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
    paddingTop: 50,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFC107',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  // mapImage: {
  //   width: '100%',
  //   height: '100%',
  // },
  userIdContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  userIdText: {
    fontSize: 10,
    color: '#6B7280',
  },
  adModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adContent: {
    width: '80%',
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  adTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  adText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  messageModalContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: '80%',
    zIndex: 10,
  },
  messageBox: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  messageText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarLabel: {
    fontSize: 10,
    marginTop: 4,
  },
});
