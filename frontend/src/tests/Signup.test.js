import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import Signup from '../components/Authentication/Signup';
import ChatProvider from '../Context/ChatProvider';

const renderSignup = () =>
  render(
    <MemoryRouter>
      <ChakraProvider>
        <ChatProvider>
          <Signup />
        </ChatProvider>
      </ChakraProvider>
    </MemoryRouter>
  );

describe('Signup Component', () => {
  it('should render signup form', () => {
    renderSignup();
    expect(screen.getByPlaceholderText('Enter Your Name')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter Your Email Address')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('should show warning if fields are empty', async () => {
    renderSignup();
    fireEvent.click(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(
        screen.getByText('Please Fill all the Feilds')
      ).toBeInTheDocument();
    });
  });

  it('should show warning if passwords do not match', async () => {
    renderSignup();

    fireEvent.change(screen.getByPlaceholderText('Enter Your Name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Email Address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), {
      target: { value: 'differentpassword' },
    });

    fireEvent.click(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(screen.getByText('Passwords Do Not Match')).toBeInTheDocument();
    });
  });

  it('should toggle password visibility', () => {
    renderSignup();
    const passwordInput = screen.getByPlaceholderText('Enter Password');
    const showButtons = screen.getAllByText('Show');

    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(showButtons[0]);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
