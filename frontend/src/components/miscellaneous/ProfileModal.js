import { ViewIcon } from '@chakra-ui/icons';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  IconButton,
  Text,
  Image,
  Input,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import axios from 'axios';
import { ChatState } from '../../Context/ChatProvider';

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState(user.name);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { user: loggedUser, setUser } = ChatState();

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: 'Name cannot be empty',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${loggedUser.token}`,
        },
      };

      const { data } = await axios.put('/api/user/profile', { name }, config);

      // Update user in localStorage and context
      const updatedUser = { ...loggedUser, name: data.name };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast({
        title: 'Name updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      setIsEditing(false);
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Failed to update name',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      setLoading(false);
    }
  };

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton
          display={{ base: 'flex' }}
          icon={<ViewIcon />}
          onClick={onOpen}
        />
      )}
      <Modal size='lg' onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent h='450px'>
          <ModalHeader
            fontSize='40px'
            fontFamily='Work sans'
            display='flex'
            justifyContent='center'
          >
            {name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display='flex'
            flexDir='column'
            alignItems='center'
            justifyContent='space-between'
          >
            <Image
              borderRadius='full'
              boxSize='150px'
              src={user.pic}
              alt={user.name}
            />
            <Text
              fontSize={{ base: '18px', md: '20px' }}
              fontFamily='Work sans'
            >
              Email: {user.email}
            </Text>
            {isEditing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Enter new name'
                mt={2}
              />
            ) : (
              <Text
                fontSize={{ base: '18px', md: '20px' }}
                fontFamily='Work sans'
              >
                Name: {name}
              </Text>
            )}
          </ModalBody>
          <ModalFooter display='flex' gap={2}>
            {isEditing ? (
              <>
                <Button
                  colorScheme='blue'
                  onClick={handleSave}
                  isLoading={loading}
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setName(user.name);
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button colorScheme='teal' onClick={() => setIsEditing(true)}>
                  Edit Name
                </Button>
                <Button onClick={onClose}>Close</Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
