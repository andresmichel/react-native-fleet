import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import * as geo from './utils/geo';
import DeviceInfo from 'react-native-device-info';

MapboxGL.setAccessToken('pk.eyJ1IjoiYW5kcmVzbWljaGVsIiwiYSI6ImNqa3k2NGFsbzBmODYza21tcWo2NjdlcGUifQ.txk49vcGtXSpKyQOnPqiOQ');

export default function App() {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [onTransit, setOnTransit] = useState(false);
  const [tasks, setTasks] = useState([]);
  function toggleOnTransit() {
    setOnTransit(!onTransit);
  }
  async function saveLocation() {
    try {
      const response = await fetch('https://fleet-dusky.now.sh/api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          deviceId: DeviceInfo.getUniqueId(),
        }),
      });
      // const data = await response.json();
    } catch (error) {
      // 
    }
  }
  // useEffect(() => {
  //   if (location.latitude !== null && location.longitude !== null) {
  //     saveLocation();
  //   }
  // }, [location]);
  return (
    <View style={styles.container}>
      {
        onTransit &&
        <MapboxGL.MapView
          style={styles.container}
          styleURL={MapboxGL.StyleURL.Dark}
          logoEnabled={false}
          onLongPress={event => setTasks([...tasks, { coordinate: event.geometry.coordinates }])}>
          <MapboxGL.UserLocation
            onUpdate={(event) => {
              if (event && onTransit) {
                const distance = Math.abs(geo.distance(
                  location.latitude,
                  location.longitude,
                  event.coords.latitude,
                  event.coords.longitude,
                  'K',
                ));
                if (distance > 0.01) {
                  setTasks([...tasks, { coordinate: [event.coords.longitude, event.coords.latitude] }])
                  setLocation({
                    latitude: event.coords.latitude,
                    longitude: event.coords.longitude,
                  });
                } else {
                  console.log('-')
                }
              }
            }}
            showsUserHeadingIndicator
          />
          <MapboxGL.Camera
            zoomLevel={11}
            followUserLocation
          />
          {tasks.map((task, index) => (
            <MapboxGL.MarkerView
              key={index}
              coordinate={task.coordinate}>
              <View height={10} width={10} style={{ backgroundColor: 'red' }} />
            </MapboxGL.MarkerView>
          ))}
          {
            tasks.length > 0 &&
            <MapboxGL.ShapeSource id={'source'} shape={{
              "type": "FeatureCollection",
              "features": [
                {
                  "type": "Feature",
                  "properties": {},
                  "geometry": {
                    "type": "LineString",
                    "coordinates": tasks.map(task => task.coordinate)
                  }
                }
              ]
            }}>
              <MapboxGL.LineLayer id={'line'} sourceID={'source'} style={{ lineColor: 'red', lineWidth: 3 }} />
            </MapboxGL.ShapeSource>
          }
        </MapboxGL.MapView>
      }
      <View style={styles.buttonWrapper}>
        <Button style={{ backgroundColor: onTransit ? 'red' : 'blue' }} title={onTransit ? 'Stop!' : 'Go!'} onPress={toggleOnTransit} />
      </View>
    </View>
  );
}

function Button(props) {
  return (
    <TouchableOpacity {...props} style={[styles.buttonContainer, props.style]}>
      <Text style={styles.buttonLabel}>{props.title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333436',
  },
  buttonWrapper: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
  },
  buttonContainer: {
    height: 100,
    width: 100,
    backgroundColor: 'blue',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
