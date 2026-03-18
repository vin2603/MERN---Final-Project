import { Avatar } from '@chakra-ui/react';
import { Tooltip } from '@chakra-ui/react';
import ScrollableFeed from 'react-scrollable-feed';
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from '../config/ChatLogics';
import { ChatState } from '../Context/ChatProvider';

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: 'flex' }} key={m._id}>
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip label={m.sender.name} placement='bottom-start' hasArrow>
                <Avatar
                  mt='7px'
                  mr={1}
                  size='sm'
                  cursor='pointer'
                  name={m.sender.name}
                  src={m.sender.pic}
                />
              </Tooltip>
            )}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems:
                  m.sender._id === user._id ? 'flex-end' : 'flex-start',
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                maxWidth: '75%',
              }}
            >
              {/* ← show sender name only for first message in a group */}
              {!isSameUser(messages, m, i, user._id) &&
                m.sender._id !== user._id && (
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#888',
                      marginBottom: '2px',
                      marginLeft: '10px',
                    }}
                  >
                    {m.sender.name}
                  </span>
                )}
              <span
                style={{
                  backgroundColor: `${
                    m.sender._id === user._id ? '#BEE3F8' : '#B9F5D0'
                  }`,
                  borderRadius: '20px',
                  padding: '5px 15px',
                }}
              >
                {m.content}
              </span>
            </div>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
