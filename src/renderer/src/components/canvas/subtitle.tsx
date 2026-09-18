import { Box, Text } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { memo, useRef, useEffect } from 'react';
import { canvasStyles } from './canvas-styles';
import { useSubtitleDisplay } from '@/hooks/canvas/use-subtitle-display';
import { useSubtitle } from '@/context/subtitle-context';

// Type definitions
interface SubtitleTextProps {
  text: string
}

// Markdown component styles for Chakra
const markdownStyles = {
  p: {
    margin: 0,
  },
  a: {
    color: 'blue.300',
    textDecoration: 'underline',
    _hover: {
      color: 'blue.200',
    },
  },
  code: {
    bg: 'whiteAlpha.200',
    px: 1,
    borderRadius: 'md',
    fontFamily: 'mono',
    fontSize: '0.9em',
  },
  pre: {
    bg: 'whiteAlpha.200',
    p: 2,
    borderRadius: 'md',
    overflow: 'auto',
    maxW: '100%',
  },
  ul: {
    margin: '0.5em 0',
    pl: 4,
  },
  ol: {
    margin: '0.5em 0',
    pl: 4,
  },
  li: {
    margin: '0.25em 0',
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  blockquote: {
    borderLeft: '3px solid',
    borderColor: 'whiteAlpha.400',
    pl: 3,
    ml: 0,
    color: 'whiteAlpha.800',
  },
};

// Reusable components
const SubtitleText = memo(({ text }: SubtitleTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when text changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text]);

  return (
    <Box ref={containerRef} {...canvasStyles.subtitle.text} overflow="auto" maxH="300px">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <Text {...markdownStyles.p}>{children}</Text>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              style={{
                color: '#90cdf4',
                textDecoration: 'underline',
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          code: ({ className, children }) => {
            const isInline = !className;
            return isInline ? (
              <Text as="code" {...markdownStyles.code}>
                {children}
              </Text>
            ) : (
              <Box as="pre" {...markdownStyles.pre}>
                <code>{children}</code>
              </Box>
            );
          },
          pre: ({ children }) => (
            <Box as="pre" {...markdownStyles.pre}>
              {children}
            </Box>
          ),
          ul: ({ children }) => (
            <Box as="ul" {...markdownStyles.ul}>
              {children}
            </Box>
          ),
          ol: ({ children }) => (
            <Box as="ol" {...markdownStyles.ol}>
              {children}
            </Box>
          ),
          li: ({ children }) => (
            <Box as="li" {...markdownStyles.li}>
              {children}
            </Box>
          ),
          strong: ({ children }) => (
            <Text {...markdownStyles.strong}>{children}</Text>
          ),
          em: ({ children }) => (
            <Text {...markdownStyles.em}>{children}</Text>
          ),
          blockquote: ({ children }) => (
            <Box as="blockquote" {...markdownStyles.blockquote}>
              {children}
            </Box>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </Box>
  );
});

SubtitleText.displayName = 'SubtitleText';

// Main component
const Subtitle = memo((): JSX.Element | null => {
  const { subtitleText, isLoaded } = useSubtitleDisplay();
  const { showSubtitle } = useSubtitle();

  if (!isLoaded || !subtitleText || !showSubtitle) return null;

  return (
    <Box {...canvasStyles.subtitle.container}>
      <SubtitleText text={subtitleText} />
    </Box>
  );
});

Subtitle.displayName = 'Subtitle';

export default Subtitle;
