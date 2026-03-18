import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import ScrollableChat from '../components/ScrollableChat';
import { ChatState } from '../Context/ChatProvider';

jest.mock('../Context/ChatProvider', () => ({
  ChatState: jest.fn(),
}));

jest.mock('react-scrollable-feed', () => {
  return function MockScrollableFeed({ children }) {
    return children;
  };
});

const mockUser = {
  _id: 'user1',
  name: 'Test User',
  email: 'test@example.com',
};

const mockMessages = [
  {
    _id: 'msg1',
    content: 'Hello there!',
    sender: { _id: 'user2', name: 'Other User', pic: '' },
    chat: { _id: 'chat1' },
  },
  {
    _id: 'msg2',
    content: 'Hi back!',
    sender: { _id: 'user1', name: 'Test User', pic: '' },
    chat: { _id: 'chat1' },
  },
  {
    _id: 'msg3',
    content: 'How are you?',
    sender: { _id: 'user2', name: 'Other User', pic: '' },
    chat: { _id: 'chat1' },
  },
];

const renderScrollableChat = (messages = mockMessages) => {
  ChatState.mockReturnValue({ user: mockUser });

  return render(
    <ChakraProvider>
      <ScrollableChat messages={messages} />
    </ChakraProvider>
  );
};

describe('ScrollableChat Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render all messages', () => {
    renderScrollableChat();
    expect(screen.getByText('Hello there!')).toBeInTheDocument();
    expect(screen.getByText('Hi back!')).toBeInTheDocument();
    expect(screen.getByText('How are you?')).toBeInTheDocument();
  });

  it('should render with empty messages array', () => {
    renderScrollableChat([]);
    expect(screen.queryByText('Hello there!')).not.toBeInTheDocument();
  });

  it('should show sender name above received messages', () => {
    renderScrollableChat();
    expect(screen.getAllByText('Other User').length).toBeGreaterThan(0);
  });

  it('should apply blue color to sent messages', () => {
    renderScrollableChat();
    const sentMessage = screen.getByText('Hi back!');
    expect(sentMessage).toHaveStyle({ backgroundColor: '#BEE3F8' });
  });

  it('should apply green color to received messages', () => {
    renderScrollableChat();
    const receivedMessage = screen.getByText('Hello there!');
    expect(receivedMessage).toHaveStyle({ backgroundColor: '#B9F5D0' });
  });
});
