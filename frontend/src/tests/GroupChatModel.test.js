import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import GroupChatModal from '../components/miscellaneous/GroupChatModal';
import { ChatState } from '../Context/ChatProvider';

jest.mock('axios');
jest.mock('../Context/ChatProvider', () => ({
  ChatState: jest.fn(),
  __esModule: true,
  default: ({ children }) => children,
}));

const mockUser = {
  _id: 'user1',
  name: 'Test User',
  email: 'test@example.com',
  token: 'mocktoken123',
};

const renderGroupChatModal = (overrides = {}) => {
  ChatState.mockReturnValue({
    user: mockUser,
    chats: [],
    setChats: jest.fn(),
    ...overrides,
  });

  return render(
    <MemoryRouter>
      <ChakraProvider>
        <GroupChatModal>
          <button>New Group Chat</button>
        </GroupChatModal>
      </ChakraProvider>
    </MemoryRouter>
  );
};

describe('GroupChatModal Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render trigger button', () => {
    renderGroupChatModal();
    expect(screen.getByText('New Group Chat')).toBeInTheDocument();
  });

  it('should open modal when trigger is clicked', async () => {
    renderGroupChatModal();
    fireEvent.click(screen.getByText('New Group Chat'));

    await waitFor(() => {
      expect(screen.getByText('Create Group Chat')).toBeInTheDocument();
    });
  });

  it('should render form fields when modal is open', async () => {
    renderGroupChatModal();
    fireEvent.click(screen.getByText('New Group Chat'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Chat Name')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Add Users eg: John, Piyush, Jane')
      ).toBeInTheDocument();
    });
  });

  it('should show warning when creating group without fields', async () => {
    renderGroupChatModal();
    fireEvent.click(screen.getByText('New Group Chat'));

    await waitFor(() => {
      expect(screen.getByText('Create Chat')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Create Chat'));

    await waitFor(() => {
      expect(
        screen.getByText('Please fill all the feilds')
      ).toBeInTheDocument();
    });
  });

  it('should search for users when typing', async () => {
    axios.get.mockResolvedValue({
      data: [
        {
          _id: 'user2',
          name: 'Other User',
          email: 'other@example.com',
          pic: '',
        },
      ],
    });

    renderGroupChatModal();
    fireEvent.click(screen.getByText('New Group Chat'));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Add Users eg: John, Piyush, Jane')
      ).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText('Add Users eg: John, Piyush, Jane'),
      { target: { value: 'Other' } }
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  it('should create group chat successfully', async () => {
    const mockSetChats = jest.fn();
    renderGroupChatModal({ setChats: mockSetChats });

    axios.post.mockResolvedValue({
      data: {
        _id: 'group1',
        chatName: 'My Group',
        isGroupChat: true,
        users: [],
      },
    });

    fireEvent.click(screen.getByText('New Group Chat'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Chat Name')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Chat Name'), {
      target: { value: 'My Group' },
    });

    fireEvent.click(screen.getByText('Create Chat'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/chat/group',
        expect.any(Object),
        expect.any(Object)
      );
    });
  });
});
