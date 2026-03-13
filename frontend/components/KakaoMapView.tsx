import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Toilet } from '../app/(tabs)/restroom_finder';  // 화장실(변기) 데이터 타입 import

//const KAKAO_MAP_JS_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_KAKAO_MAP_JS_KEY || process.env.EXPO_PUBLIC_KAKAO_MAP_JS_KEY;
const KAKAO_MAP_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_MAP_JS_KEY;

// 💡 경고: 만약 KAKAO_MAP_JS_KEY가 undefined이면 여기서 에러가 날 수 있습니다.
console.log("Kakao Key Loaded:", KAKAO_MAP_JS_KEY ? "Loaded" : "Undefined");
console.log("Key : "  + KAKAO_MAP_JS_KEY);

/*
✅ 이 컴포넌트가 받을 props 타입 정의
  - toilets: 화장실 리스트
  - userLocation: 사용자 현재 위치 (위도/경도)
  - onMarkerClick: 마커 클릭 시 부모에게 선택된 화장실 id 알려주는 콜백
*/
interface KakaoMapViewProps {
  toilets: Toilet[];
  userLocation: { lat: number; lon: number; };
  onMarkerClick: (toiletId: string) => void;
  onSearchMarkerClick?: (place: any) => void;
  recenterTrigger?: number;
  searchKeyword?: string;
  selectedToiletId?: string | null;
  selectedSearchPlaceId?: string | null;
}

/*
✅ WebView에 넣을 HTML 문자열을 만들어주는 함수 (Toilet 목록을 지도에 마커표시)
  - toilets: 마커로 찍을 화장실 목록
  - userLocation: 지도 중심으로 사용할 사용자 위치
*/
const createMapHtml = (toilets: Toilet[], userLocation: { lat: number; lon: number; }) => {
  // 지도의 중심을 사용자 위치로 잡음
  const centerLat = userLocation.lat;
  const centerLon = userLocation.lon;
  
  // Toilet[] 데이터를 브라우저에서 쓰기 좋은 형태로 변환
  const markerData = toilets.map(t => ({
    name: t.name,
    lat: t.coords.lat,
    lon: t.coords.lon,
    id: t.id,
  }));
  const markerDataJson = JSON.stringify(markerData);

  /*
  ✅ 카카오맵 Web API를 사용하는 HTML 구조 정의
    - 카카오 지도 JS SDK를 불러와서
    - 지도 생성 + 마커 찍기 + 마커 클릭 이벤트 설정까지 담당
  */
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
      <title>Kakao Map</title>
      <!-- 지도그리는 API 불러오기 -->
      <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_JS_KEY}&libraries=services&autoload=false"></script>
      <style>
        html, body, #map {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }
      </style>
    </head>
    <body>
    <!-- 지도를 그릴 div -->
      <div id="map"></div>
      <script>
        // 1. 지도 컨테이너와 옵션 설정
        var container = document.getElementById('map');
        var options = {
          // ✅ 카카오 LatLng(위도, 경도) 객체 생성
          center: new kakao.maps.LatLng(${centerLat}, ${centerLon}), 
          level: 4 // 지도 확대 레벨
        };
        
        // 2. 지도 생성
        var map = new kakao.maps.Map(container, options);
        
        // 3. 화장실 마커 데이터 로드 및 표시
        var toilets = ${markerDataJson};

        // 4. 각 화장실에 대해 마커 생성
        toilets.forEach(function(toilet) {
          var position = new kakao.maps.LatLng(toilet.lat, toilet.lon);
          
          var marker = new kakao.maps.Marker({
            map: map,
            position: position,
            title: toilet.name,
          });
          
          // 5. 마커 클릭 이벤트 등록
          // 마커 클릭 시 React Native로 메시지 전송
          kakao.maps.event.addListener(marker, 'click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerClick', id: toilet.id }));
          });
        });
      </script>
    </body>
    </html>
  `;
};

// ✅ 실제로 RN 화면에서 사용하게 될 컴포넌트
const KakaoMapView: React.FC<KakaoMapViewProps> = ({ toilets, userLocation, onMarkerClick }) => {
  
  // 💡 WebView로부터 메시지를 수신하는 핸들러 함수
  // (마커 클릭 시 WebView에서 postMessage 한 데이터가 여기로 옴)
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerClick') {
        // 부모 컴포넌트(restroom_finder)에서 넘겨준 콜백 실행
        // → 선택된 화장실 id 전달
        onMarkerClick(data.id);
      }
    } catch (e) {
      console.error("WebView 메시지 파싱 오류:", e);
    }
  };

  return (
    <WebView
      style={styles.mapWebView}
      source={{ html: createMapHtml(toilets, userLocation) }}
      // 💡 WebView에서 RN으로 메시지를 보낼 때 호출
      onMessage={handleWebViewMessage}
      javaScriptEnabled={true}
      // 💡 window.ReactNativeWebView.postMessage 함수를 전역으로 설정하여 통신 가능하게 함
      injectedJavaScript={`
        window.postMessage = function(data) {
          window.ReactNativeWebView.postMessage(data);
        };
        true; // 이 값은 항상 true로 반환해야 경고가 사라집니다.
      `}
      originWhitelist={['*']}
      allowFileAccess={true} // 로컬 파일 접근 허용 (필요시)
    />
  );
};

const styles = StyleSheet.create({
  mapWebView: { 
    width: '100%',
    height: '100%',
  },
});

export default KakaoMapView;