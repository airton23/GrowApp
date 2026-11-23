import React from 'react';
import { ViewProps, TextProps } from 'react-native';
import { LinearGradientProps } from 'react-native-linear-gradient';

export const Container: React.ComponentType<Partial<LinearGradientProps> & { children?: React.ReactNode }>;
export const Header: React.ComponentType<ViewProps & { children?: React.ReactNode }>;
export const Title: React.ComponentType<TextProps & { children?: React.ReactNode }>;
export const ContentCard: React.ComponentType<ViewProps & { children?: React.ReactNode }>;
export const ListHeader: React.ComponentType<ViewProps & { children?: React.ReactNode }>;
export const SectionTitle: React.ComponentType<TextProps & { children?: React.ReactNode }>;

