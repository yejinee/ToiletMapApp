// 💡 @env 대신 expo-constants를 사용합니다.
//import Constants from 'expo-constants';
import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Toilet } from '../app/(tabs)/restroom_finder';

//const KAKAO_MAP_JS_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_KAKAO_MAP_JS_KEY || process.env.EXPO_PUBLIC_KAKAO_MAP_JS_KEY;
const KAKAO_MAP_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_MAP_JS_KEY;

// 💡 경고: 만약 KAKAO_MAP_JS_KEY가 undefined이면 여기서 에러가 날 수 있습니다.
// 개발 단계에서 KAKAO_MAP_JS_KEY의 값이 제대로 들어오는지 Console.log로 확인해 보세요.
console.log("Kakao Key Loaded:", KAKAO_MAP_JS_KEY ? "Loaded" : "Undefined");

interface KakaoMapViewProps {
  toilets: Toilet[];
  userLocation: { lat: number; lon: number; };
  onMarkerClick: (toiletId: string) => void;
}

// 💡 Toilet 목록을 지도에 마커로 표시하기 위한 HTML 생성 함수
const createMapHtml = (toilets: Toilet[], userLocation: { lat: number; lon: number; }) => {
  const centerLat = userLocation.lat;
  const centerLon = userLocation.lon;
  
  // 마커 데이터를 JavaScript 배열 형태로 변환
  const markerData = toilets.map(t => ({
    name: t.name,
    lat: t.coords.lat,
    lon: t.coords.lon,
    id: t.id,
  }));
  const markerDataJson = JSON.stringify(markerData);

  // 카카오맵 Web API를 사용하는 HTML 구조 정의
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
      <title>Kakao Map</title>
      <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_JS_KEY}&libraries=services"></script>
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
      <div id="map"></div>
      <script>
        // 1. 지도 컨테이너와 옵션 설정
        var container = document.getElementById('map');
        var options = {
          center: new kakao.maps.LatLng(${centerLat}, ${centerLon}), // 사용자 위치를 중심 좌표로
          level: 4 // 지도 확대 레벨
        };
        
        // 2. 지도 생성
        var map = new kakao.maps.Map(container, options);
        
        // 3. 화장실 마커 데이터 로드 및 표시
        var toilets = ${markerDataJson};

        toilets.forEach(function(toilet) {
          var position = new kakao.maps.LatLng(toilet.lat, toilet.lon);
          
          var marker = new kakao.maps.Marker({
            map: map,
            position: position,
            title: toilet.name,
          });

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

const KakaoMapView: React.FC<KakaoMapViewProps> = ({ toilets, userLocation, onMarkerClick }) => {
  
  // 💡 WebView로부터 메시지를 수신하는 핸들러 함수
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerClick') {
        // 부모 컴포넌트(restroom_finder)의 콜백 함수 호출
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