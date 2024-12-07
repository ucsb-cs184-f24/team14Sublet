import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const LoadingEgg = ({ size = 100 }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = () => {
      return Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]);
    };

    const loopAnimation = Animated.loop(createAnimation());
    loopAnimation.start();

    return () => loopAnimation.stop();
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.eggContainer, { transform: [{ rotate: rotation }] }]}>
        <Svg width={size} height={size * 1.25} viewBox="0 0 100 125">
          <Path
            d="M50 5 C20 5 5 50 5 80 C5 110 20 120 50 120 C80 120 95 110 95 80 C95 50 80 5 50 5Z"
            fill="#FFD700"
            stroke="#DAA520"
            strokeWidth="2"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eggContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LoadingEgg;