import {
  LuBell, LuSend, LuMic, LuMicOff, LuHand, LuX,
} from 'react-icons/lu';
import {
  Box,
  Button,
  Flex,
  Input,
  Stack,
  Text,
  VStack,
  IconButton,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useEffect, useCallback } from 'react';
import { useInputSubtitle } from '@/hooks/electron/use-input-subtitle';
import { useDraggable } from '@/hooks/electron/use-draggable';
import { inputSubtitleStyles } from './electron-style';
import { useMode } from '@/context/mode-context';

// Markdown component styles for pet mode message display
const messageMarkdownStyles = {
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
    borderRadius: 'sm',
    fontFamily: 'mono',
    fontSize: '0.85em',
  },
  pre: {
    bg: 'whiteAlpha.200',
    p: 2,
    borderRadius: 'md',
    overflow: 'auto',
    maxW: '100%',
  },
  ul: {
    margin: '0.25em 0',
    pl: 3,
  },
  ol: {
    margin: '0.25em 0',
    pl: 3,
  },
  li: {
    margin: '0.15em 0',
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
};

export function InputSubtitle() {
  const {
    inputValue,
    handleInputChange,
    handleKeyPress,
    handleCompositionStart,
    handleCompositionEnd,
    handleInterrupt,
    handleMicToggle,
    handleSend,
    lastAIMessage,
    hasAIMessages,
    aiState,
    micOn,
  } = useInputSubtitle();

  const { mode } = useMode();
  const isPet = mode === 'pet';

  const {
    elementRef,
    isDragging,
    handleMouseDown,
    handleMouseEnter,
    handleMouseLeave,
  } = useDraggable({
    componentId: 'input-subtitle',
  });

  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    if (isPet) {
      (window.api as any)?.updateComponentHover('input-subtitle', false);
    }
    setIsVisible(false);
  }, [isPet]);

  const handleOpen = () => {
    setIsVisible(true);
  };

  useEffect(() => {
    if (isPet) {
      const cleanup = (window.api as any)?.onToggleInputSubtitle(() => {
        if (isVisible) {
          handleClose();
        } else {
          handleOpen();
        }
      });
      return () => cleanup?.();
    }
    return () => {};
  }, [handleClose, isPet, isVisible]);

  useEffect(() => {
    (window as any).inputSubtitle = {
      open: handleOpen,
      close: handleClose,
    };

    return () => {
      delete (window as any).inputSubtitle;
    };
  }, [isPet, handleClose]);

  if (!isVisible) return null;

  return (
    <Box
      ref={elementRef}
      {...inputSubtitleStyles.container}
      {...inputSubtitleStyles.draggableContainer(isDragging)}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Box {...inputSubtitleStyles.box}>
        <IconButton
          aria-label="Close subtitle"
          onClick={handleClose}
          {...inputSubtitleStyles.closeButton}
        >
          <LuX size={12} />
        </IconButton>

        {hasAIMessages && (
          <VStack
            minH={lastAIMessage ? '32px' : '0px'}
            {...inputSubtitleStyles.messageStack}
          >
            {lastAIMessage && (
              <Box
                {...inputSubtitleStyles.messageText}
                overflow="auto"
                maxH="120px"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <Text {...messageMarkdownStyles.p}>{children}</Text>
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
                        <Text as="code" {...messageMarkdownStyles.code}>
                          {children}
                        </Text>
                      ) : (
                        <Box as="pre" {...messageMarkdownStyles.pre}>
                          <code>{children}</code>
                        </Box>
                      );
                    },
                    pre: ({ children }) => (
                      <Box as="pre" {...messageMarkdownStyles.pre}>
                        {children}
                      </Box>
                    ),
                    ul: ({ children }) => (
                      <Box as="ul" {...messageMarkdownStyles.ul}>
                        {children}
                      </Box>
                    ),
                    ol: ({ children }) => (
                      <Box as="ol" {...messageMarkdownStyles.ol}>
                        {children}
                      </Box>
                    ),
                    li: ({ children }) => (
                      <Box as="li" {...messageMarkdownStyles.li}>
                        {children}
                      </Box>
                    ),
                    strong: ({ children }) => (
                      <Text {...messageMarkdownStyles.strong}>{children}</Text>
                    ),
                    em: ({ children }) => (
                      <Text {...messageMarkdownStyles.em}>{children}</Text>
                    ),
                  }}
                >
                  {lastAIMessage}
                </ReactMarkdown>
              </Box>
            )}
          </VStack>
        )}

        <Box {...inputSubtitleStyles.statusBox}>
          <Flex align="center" justify="space-between" color="whiteAlpha.700">
            <Flex align="center" gap="2">
              <LuBell size={16} />
              <Text {...inputSubtitleStyles.statusText}>
                {aiState}
              </Text>
            </Flex>

            <Flex gap="2">
              <IconButton
                aria-label="Toggle microphone"
                onClick={handleMicToggle}
                {...inputSubtitleStyles.iconButton}
              >
                {micOn ? <LuMic size={16} /> : <LuMicOff size={16} />}
              </IconButton>
              <IconButton
                aria-label="Interrupt"
                onClick={handleInterrupt}
                {...inputSubtitleStyles.iconButton}
              >
                <LuHand size={16} />
              </IconButton>
            </Flex>
          </Flex>
        </Box>

        <Box {...inputSubtitleStyles.inputBox}>
          <Stack direction="row" gap="2" p="2">
            <Input
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder="Type your message..."
              {...inputSubtitleStyles.input}
            />
            <Button
              onClick={handleSend}
              {...inputSubtitleStyles.sendButton}
            >
              <LuSend size={16} />
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
