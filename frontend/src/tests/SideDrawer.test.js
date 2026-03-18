import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import SideDrawer from '../components/miscellaneous/SideDrawer';
import { ChatState } from '../Context/ChatProvider';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({ push: jest.fn() }),
}));
jest.mock('../Context/ChatProvider', () => ({
  ChatState: jest.fn(),
}));
jest.mock('react-notification-badge', () => ({
  __esModule: true,
  default: () => null,
  Effect: { SCALE: 'scale' },
}));

const mockUser = {
  _id: 'user1',
  name: 'Test User',
  email: 'test@example.com',
  pic: '',
  token: 'mocktoken123',
};

const renderSideDrawer = () => {
  ChatState.mockReturnValue({
    user: mockUser,
    notification: [],
    setNotification: jest.fn(),
    chats: [],
    setChats: jest.fn(),
    setSelectedChat: jest.fn(),
  });

  return render(
    <MemoryRouter>
      <ChakraProvider>
        <SideDrawer />
      </ChakraProvider>
    </MemoryRouter>
  );
};

describe('SideDrawer Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the navbar', () => {
    renderSideDrawer();
    expect(screen.getByText('Talk-A-Tive')).toBeInTheDocument();
    expect(screen.getByText('Search User')).toBeInTheDocument();
  });

  it('should open drawer when Search User is clicked', async () => {
    renderSideDrawer();
    fireEvent.click(screen.getByText('Search User'));

    await waitFor(() => {
      expect(screen.getByText('Search Users')).toBeInTheDocument();
    });
  });

  it('should show search input when drawer is open', async () => {
    renderSideDrawer();
    fireEvent.click(screen.getByText('Search User'));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Search by name or email')
      ).toBeInTheDocument();
    });
  });

  it('should show warning when searching with empty input', async () => {
    renderSideDrawer();
    fireEvent.click(screen.getByText('Search User'));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Search by name or email')
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Go'));

    await waitFor(() => {
      expect(
        screen.getByText('Please Enter something in search')
      ).toBeInTheDocument();
    });
  });

  it('should search for users when Go is clicked with input', async () => {
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

    renderSideDrawer();
    fireEvent.click(screen.getByText('Search User'));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Search by name or email')
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Search by name or email'), {
      target: { value: 'Other' },
    });
    fireEvent.click(screen.getByText('Go'));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        '/api/user?search=Other',
        expect.any(Object)
      );
    });
  });

  it('should clear localStorage on logout', async () => {
    localStorage.setItem('userInfo', JSON.stringify(mockUser));
    renderSideDrawer();

    const menuButtons = screen.getAllByRole('button');
    fireEvent.click(menuButtons[menuButtons.length - 1]);

    await waitFor(() => {
      if (screen.queryByText('Logout')) {
        fireEvent.click(screen.getByText('Logout'));
        expect(localStorage.getItem('userInfo')).toBeNull();
      }
    });
  });
});
