import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export function WaveBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFE4B5" stopOpacity="1" />
            <Stop offset="0.5" stopColor="#F3B33D" stopOpacity="1" />
            <Stop offset="1" stopColor="#CC8E1E" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Path
          d={`
            M0 0
            L0 ${height}
            L${width} ${height}
            L${width} 0
            Z
          `}
          fill="url(#grad)"
        />
        <Path
          d={`
            M0 ${height * 0.5}
            Q ${width * 0.2} ${height * 0.48} ${width * 0.4} ${height * 0.5}
            T ${width * 0.8} ${height * 0.5}
            T ${width} ${height * 0.5}
            L${width} ${height}
            L0 ${height}
            Z
          `}
          fill="#F3B33D"
          opacity="0.4"
        />
        <Path
          d={`
            M0 ${height * 0.55}
            Q ${width * 0.25} ${height * 0.53} ${width * 0.5} ${height * 0.55}
            T ${width} ${height * 0.55}
            L${width} ${height}
            L0 ${height}
            Z
          `}
          fill="#E5A42E"
          opacity="0.3"
        />
        <Path
          d={`
            M0 ${height * 0.6}
            Q ${width * 0.15} ${height * 0.58} ${width * 0.3} ${height * 0.6}
            T ${width * 0.6} ${height * 0.6}
            T ${width} ${height * 0.6}
            L${width} ${height}
            L0 ${height}
            Z
          `}
          fill="#D69423"
          opacity="0.2"
        />
        <Path
          d={`
            M0 ${height}
            L0 ${height * 0.85}
            Q ${width * 0.25} ${height * 0.83} ${width * 0.5} ${height * 0.85}
            T ${width} ${height * 0.85}
            L${width} ${height}
            Z
          `}
          fill="#CC8E1E"
          opacity="0.4"
        />
      </Svg>
    </View>
  );
}