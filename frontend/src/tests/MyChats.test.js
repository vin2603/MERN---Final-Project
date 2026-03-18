import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import MyChats from '../components/MyChats';
import { ChatState } from '../Context/ChatProvider';

jest.mock('axios');
jest.mock('../Context/ChatProvider', () => ({
  ChatState: jest.fn(),
  __esModule: true,
  default: ({ children }) => children,
}));

const mockChats = [
  {
    _id: 'chat1',
    isGroupChat: false,
    chatName: 'sender',
    users: [
      { _id: 'user1', name: 'Test User', email: 'test@example.com' },
      { _id: 'user2', name: 'Other User', email: 'other@example.com' },
    ],
    latestMessage: {
      sender: { name: 'Other User' },
      content: 'Hello there!',
    },
  },
  {
    _id: 'chat2',
    isGroupChat: true,
    chatName: 'Test Group',
    users: [
      { _id: 'user1', name: 'Test User', email: 'test@example.com' },
      { _id: 'user2', name: 'Other User', email: 'other@example.com' },
    ],
    latestMessage: null,
  },
];

const mockUser = {
  _id: 'user1',
  name: 'Test User',
  email: 'test@example.com',
  token: 'mocktoken123',
};

const renderMyChats = (overrides = {}) => {
  ChatState.mockReturnValue({
    selectedChat: null,
    setSelectedChat: jest.fn(),
    user: mockUser,
    chats: mockChats,
    setChats: jest.fn(),
    ...overrides,
  });

  return render(
    <MemoryRouter>
      <ChakraProvider>
        <MyChats fetchAgain={false} />
      </ChakraProvider>
    </MemoryRouter>
  );
};

describe('MyChats Component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockChats });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render My Chats heading', () => {
    renderMyChats();
    expect(screen.getByText('My Chats')).toBeInTheDocument();
  });

  it('should render New Group Chat button', () => {
    renderMyChats();
    expect(screen.getByText('New Group Chat')).toBeInTheDocument();
  });

  it('should render list of chats', () => {
    renderMyChats();
    // "Other User" appears inside a <b> tag, so use getAllByText
    expect(screen.getAllByText((content, element) => element?.textContent?.includes("Other User")).length).toBeGreaterThan(0);
    expect(screen.getByText('Test Group')).toBeInTheDocument();
  });

  it('should render latest message preview', () => {
    renderMyChats();
    expect(screen.getByText('Hello there!')).toBeInTheDocument();
  });

  it('should call setSelectedChat when a chat is clicked', () => {
    const mockSetSelectedChat = jest.fn();
    renderMyChats({ setSelectedChat: mockSetSelectedChat });

    // Click "Test User" (the chat name rendered for non-group chat)
    fireEvent.click(screen.getByText('Test User'));
    expect(mockSetSelectedChat).toHaveBeenCalledWith(mockChats[0]);
  });

  it('should delete a chat when delete button is clicked', async () => {
    axios.delete.mockResolvedValue({
      data: { message: 'Chat deleted successfully' },
    });
    const mockSetChats = jest.fn();
    renderMyChats({ setChats: mockSetChats });

    // IconButton with no aria-label — find all unnamed buttons and pick the delete ones
    const allButtons = screen.getAllByRole('button');
    const deleteButtons = allButtons.filter(
      (btn) => !btn.textContent.includes('New Group Chat')
    );
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        `/api/chat/${mockChats[0]._id}`,
        expect.any(Object)
      );
    });
  });

  it('should show error toast when fetch fails', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));
    renderMyChats();
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });
});
