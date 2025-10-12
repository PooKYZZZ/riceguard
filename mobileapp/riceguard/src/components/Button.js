import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { fonts } from '../theme/typography';

export default function Button({ variant = 'primary', style, textStyle, children, ...props }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.base, variant === 'primary' ? styles.primary : styles.outline, style]}
      {...props}
    >
      <Text style={[styles.text, variant === 'primary' ? styles.textPrimary : styles.textOutline, textStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  outline: {
    borderWidth: 1,
    borderColor: '#2563eb',
    backgroundColor: 'transparent',
  },
  text: { fontSize: 16, fontFamily: fonts.semi },
  textPrimary: { color: 'white' },
  textOutline: { color: '#2563eb' },
});
