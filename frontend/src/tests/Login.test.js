import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../components/Authentication/Login';
import ChatProvider from '../Context/ChatProvider';

const renderLogin = () =>
  render(
    <MemoryRouter>
      <ChakraProvider>
        <ChatProvider>
          <Login />
        </ChatProvider>
      </ChakraProvider>
    </MemoryRouter>
  );

describe('Login Component', () => {
  it('should render login form', () => {
    renderLogin();
    expect(
      screen.getByPlaceholderText('Enter Your Email Address')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('should show/hide password on button click', () => {
    renderLogin();
    const passwordInput = screen.getByPlaceholderText('Enter password');
    const showButton = screen.getByText('Show');

    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(showButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByText('Hide'));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should fill guest credentials on button click', () => {
    renderLogin();
    const guestButton = screen.getByText('Get Guest User Credentials');
    fireEvent.click(guestButton);

    expect(screen.getByPlaceholderText('Enter Your Email Address').value).toBe(
      'guest@example.com'
    );
    expect(screen.getByPlaceholderText('Enter password').value).toBe('123456');
  });

  it('should show warning if fields are empty on submit', async () => {
    renderLogin();
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(
        screen.getByText('Please Fill all the Feilds')
      ).toBeInTheDocument();
    });
  });
});
