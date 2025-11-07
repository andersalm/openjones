import React from 'react';
import { theme } from '../../theme';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: keyof typeof theme.spacing;
  centered?: boolean;
  children: React.ReactNode;
}

/**
 * Container component for layout and content wrapping
 *
 * @example
 * <Container maxWidth="lg" centered padding="lg">
 *   <h1>Game Content</h1>
 * </Container>
 */
export const Container: React.FC<ContainerProps> = ({
  maxWidth = 'lg',
  padding = 'md',
  centered = false,
  children,
  style,
  ...props
}) => {
  const getMaxWidthValue = (): string => {
    switch (maxWidth) {
      case 'sm':
        return '640px';
      case 'md':
        return '768px';
      case 'lg':
        return '1024px';
      case 'xl':
        return '1280px';
      case 'full':
        return '100%';
      default:
        return '1024px';
    }
  };

  const containerStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: getMaxWidthValue(),
    padding: theme.spacing[padding],
    margin: centered ? '0 auto' : '0',
    boxSizing: 'border-box',
    ...style,
  };

  return (
    <div style={containerStyles} {...props}>
      {children}
    </div>
  );
};

export default Container;
