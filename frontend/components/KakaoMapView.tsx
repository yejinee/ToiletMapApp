import React, { useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Toilet, SearchPlace } from '../app/(tabs)/restroom_finder';

const KAKAO_MAP_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_MAP_JS_KEY;

console.log("Kakao Key Loaded:", KAKAO_MAP_JS_KEY ? "Loaded" : "Undefined");

interface KakaoMapViewProps {
  toilets: Toilet[];
  userLocation: { lat: number; lon: number; };
  onMarkerClick: (toiletId: string) => void;
  onSearchMarkerClick?: (place: SearchPlace) => void;
  onNearbyPlacesFound?: (places: SearchPlace[]) => void;
  onMapCenterChange?: (loc: { lat: number; lon: number }) => void;
  nearbyPlaces?: SearchPlace[];
  searchResults?: SearchPlace[];
  recenterTrigger?: number;
  searchKeyword?: string;
  selectedToiletId?: string | null;
  selectedSearchPlaceId?: string | null;
}

const createMapHtml = (toilets: Toilet[], userLocation: { lat: number; lon: number; }) => {
  const centerLat = userLocation.lat;
  const centerLon = userLocation.lon;

  const markerData = toilets.map(t => ({
    name: t.name,
    lat: t.coords.lat,
    lon: t.coords.lon,
    id: t.id,
  }));
  const markerDataJson = JSON.stringify(markerData);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
      <title>Kakao Map</title>
      <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_JS_KEY}&libraries=services&autoload=false"></script>
      <style>
        html, body, #map { width:100%; height:100%; margin:0; padding:0; }

        /* 현재 위치 도트 (Moss Green) */
        .loc-dot {
          position:absolute; top:0; left:0;
          width:16px; height:16px;
          border-radius:50%;
          background:#8A9A5B;
          border:2.5px solid #fff;
          box-shadow:0 2px 6px rgba(28,25,23,0.35);
          z-index:2;
        }
        .loc-pulse {
          position:absolute; top:-7px; left:-7px;
          width:30px; height:30px;
          border-radius:50%;
          background:rgba(138,154,91,0.22);
          animation:pulse 2s ease-out infinite;
          z-index:1;
        }
        @keyframes pulse {
          0%   { transform:scale(0.8); opacity:0.9; }
          70%  { transform:scale(1.5); opacity:0; }
          100% { transform:scale(0.8); opacity:0; }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        kakao.maps.load(function() {
          var container = document.getElementById('map');
          var options = {
            center: new kakao.maps.LatLng(${centerLat}, ${centerLon}),
            level: 4
          };
          var map = new kakao.maps.Map(container, options);
          window.kakaoMap = map;

          // 지도 드래그/줌 완료 시 중심 좌표를 RN으로 전송
          kakao.maps.event.addListener(map, 'idle', function() {
            var center = map.getCenter();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapCenterChange',
              lat: center.getLat(),
              lon: center.getLng()
            }));
          });

          var toilets = ${markerDataJson};

          /* ── 현재 위치 오버레이 (Moss Green 도트) ── */
          var locDiv = document.createElement('div');
          locDiv.style.cssText = 'position:relative;width:16px;height:16px;';
          locDiv.innerHTML = '<div class="loc-pulse"></div><div class="loc-dot"></div>';
          new kakao.maps.CustomOverlay({
            map: map,
            position: new kakao.maps.LatLng(${centerLat}, ${centerLon}),
            content: locDiv,
            zIndex: 10
          });

          /* ── 화장실 마커 (Terracotta SVG 핀) ── */
          var toiletPinSvg = ''
            + '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="46" viewBox="0 0 34 46">'
            + '<circle cx="17" cy="17" r="15" fill="#A0522D" stroke="#F1ECE2" stroke-width="2.5"/>'
            + '<circle cx="17" cy="17" r="10.5" fill="none" stroke="#F1ECE2" stroke-width="1" opacity="0.45"/>'
            + '<polygon points="11,29 23,29 17,46" fill="#A0522D"/>'
            + '<text x="17" y="22" text-anchor="middle" fill="#F1ECE2" font-size="11" font-weight="700" font-family="Arial,sans-serif">WC</text>'
            + '</svg>';

          toilets.forEach(function(toilet) {
            var pinDiv = document.createElement('div');
            pinDiv.style.cssText = 'cursor:pointer;width:34px;height:46px;filter:drop-shadow(0 3px 6px rgba(28,25,23,0.45));';
            pinDiv.innerHTML = toiletPinSvg;
            pinDiv.addEventListener('click', function() {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({ type: 'markerClick', id: toilet.id })
              );
            });
            new kakao.maps.CustomOverlay({
              map: map,
              position: new kakao.maps.LatLng(toilet.lat, toilet.lon),
              content: pinDiv,
              zIndex: 5,
              yAnchor: 1.0
            });
          });

          /* 검색 결과 마커 그리기 — 기존 검색 마커 제거 후 새로 그림 */
          var searchOverlays = [];
          window.drawSearchMarkers = function(places) {
            searchOverlays.forEach(function(o) { o.setMap(null); });
            searchOverlays = [];
            if (!places || places.length === 0) return;

            // 첫 번째 결과로 지도 이동
            window.kakaoMap.setCenter(new kakao.maps.LatLng(places[0].lat, places[0].lon));
            window.kakaoMap.setLevel(4);

            var searchPinSvg = ''
              + '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">'
              + '<circle cx="15" cy="14" r="12" fill="#1C1917" stroke="#F1ECE2" stroke-width="2.5"/>'
              + '<circle cx="15" cy="14" r="7" fill="none" stroke="#F1ECE2" stroke-width="1" opacity="0.5"/>'
              + '<polygon points="9,24 21,24 15,40" fill="#1C1917"/>'
              + '</svg>';

            places.forEach(function(place) {
              var el = document.createElement('div');
              el.style.cssText = 'cursor:pointer;width:30px;height:40px;filter:drop-shadow(0 3px 6px rgba(28,25,23,0.5));';
              el.innerHTML = searchPinSvg;
              el.addEventListener('click', function() {
                window.ReactNativeWebView.postMessage(
                  JSON.stringify({ type: 'nearbyMarkerClick', place: place })
                );
              });
              var overlay = new kakao.maps.CustomOverlay({
                map: window.kakaoMap, position: new kakao.maps.LatLng(place.lat, place.lon),
                content: el, zIndex: 6, yAnchor: 1.0
              });
              searchOverlays.push(overlay);
            });
          };

          window.clearSearchMarkers = function() {
            searchOverlays.forEach(function(o) { o.setMap(null); });
            searchOverlays = [];
          };

          /* 근처 장소 마커는 RN에서 REST API로 받아서 injectJavaScript로 그림 */
          window.drawNearbyMarkers = function(places) {
            var pinSvg = ''
              + '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="34" viewBox="0 0 26 34">'
              + '<circle cx="13" cy="12" r="10" fill="#D2B48C" stroke="#F1ECE2" stroke-width="2"/>'
              + '<polygon points="8,20 18,20 13,34" fill="#D2B48C"/>'
              + '</svg>';
            places.forEach(function(place) {
              var el = document.createElement('div');
              el.style.cssText = 'cursor:pointer;width:26px;height:34px;filter:drop-shadow(0 2px 4px rgba(28,25,23,0.3));';
              el.innerHTML = pinSvg;
              el.addEventListener('click', function() {
                window.ReactNativeWebView.postMessage(
                  JSON.stringify({ type: 'nearbyMarkerClick', place: place })
                );
              });
              new kakao.maps.CustomOverlay({
                map: map, position: new kakao.maps.LatLng(place.lat, place.lon),
                content: el, zIndex: 3, yAnchor: 1.0
              });
            });
          };
        });
      </script>
    </body>
    </html>
  `;
};

const KakaoMapView: React.FC<KakaoMapViewProps> = ({
  toilets,
  userLocation,
  onMarkerClick,
  onSearchMarkerClick,
  onNearbyPlacesFound,
  onMapCenterChange,
  nearbyPlaces,
  searchResults,
  recenterTrigger,
}) => {
  const webViewRef = useRef<WebView>(null);

  // 현재 위치로 지도 이동
  useEffect(() => {
    if (!recenterTrigger) return;
    webViewRef.current?.injectJavaScript(`
      if (window.kakaoMap) {
        window.kakaoMap.setCenter(new kakao.maps.LatLng(${userLocation.lat}, ${userLocation.lon}));
      }
      true;
    `);
  }, [recenterTrigger]);

  // nearbyPlaces가 업데이트되면 WebView 안의 drawNearbyMarkers 호출
  useEffect(() => {
    if (!nearbyPlaces || nearbyPlaces.length === 0) return;
    const placesJson = JSON.stringify(nearbyPlaces);
    webViewRef.current?.injectJavaScript(`
      if (window.drawNearbyMarkers) { window.drawNearbyMarkers(${placesJson}); }
      true;
    `);
  }, [nearbyPlaces]);

  // searchResults가 업데이트되면 검색 결과 마커 그리기
  useEffect(() => {
    if (searchResults === undefined) return;
    const json = JSON.stringify(searchResults);
    webViewRef.current?.injectJavaScript(`
      if (window.drawSearchMarkers) { window.drawSearchMarkers(${json}); }
      true;
    `);
  }, [searchResults]);

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerClick') {
        onMarkerClick(data.id);
      } else if (data.type === 'nearbyMarkerClick') {
        onSearchMarkerClick?.(data.place);
      } else if (data.type === 'nearbyPlaces') {
        onNearbyPlacesFound?.(data.places);
      } else if (data.type === 'mapCenterChange') {
        onMapCenterChange?.({ lat: data.lat, lon: data.lon });
      }
    } catch (e) {
      console.error("WebView 메시지 파싱 오류:", e);
    }
  };

  return (
    <WebView
      ref={webViewRef}
      style={styles.mapWebView}
      source={{ html: createMapHtml(toilets, userLocation) }}
      onMessage={handleWebViewMessage}
      javaScriptEnabled={true}
      injectedJavaScript={`
        window.postMessage = function(data) {
          window.ReactNativeWebView.postMessage(data);
        };
        true;
      `}
      originWhitelist={['*']}
      allowFileAccess={true}
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
